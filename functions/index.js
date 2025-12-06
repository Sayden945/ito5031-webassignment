/**
 * Firebase Cloud Functions for ITO5032 Web Application
 * Server-side functionality for event booking, donations, and automated tasks
 * NO ANALYTICS INCLUDED
 */

const { setGlobalOptions } = require('firebase-functions/v2')
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const admin = require('firebase-admin')
const logger = require('firebase-functions/logger')

// Initialize Firebase Admin
admin.initializeApp()

// Global options for cost control
setGlobalOptions({ maxInstances: 10 })

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
}

/**
 * Cloud Function: Process Event Booking
 * Validates availability and creates booking with atomic transaction
 */
exports.processEventBooking = onCall(async (request) => {
  const { eventId, userNotes } = request.data
  const userId = request.auth?.uid

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  if (!eventId || typeof eventId !== 'string') {
    throw new HttpsError('invalid-argument', 'Invalid event ID')
  }

  const db = admin.firestore()

  try {
    const result = await db.runTransaction(async (transaction) => {
      const eventRef = db.collection('volunteerEvents').doc(eventId)
      const eventDoc = await transaction.get(eventRef)

      if (!eventDoc.exists) {
        throw new HttpsError('not-found', 'Event not found')
      }

      const event = eventDoc.data()

      if (!event.isActive) {
        throw new HttpsError('failed-precondition', 'Event is not active')
      }

      if (event.spotsAvailable <= 0) {
        throw new HttpsError('resource-exhausted', 'No spots available')
      }

      const eventStart = event.start.toDate()
      if (eventStart <= new Date()) {
        throw new HttpsError('failed-precondition', 'Event has already started')
      }

      // Check for existing confirmed booking (allow rebooking after cancellation)
      const existingBookings = await db
        .collection('bookings')
        .where('userId', '==', userId)
        .where('eventId', '==', eventId)
        .where('status', '==', 'confirmed')
        .get()

      if (!existingBookings.empty) {
        throw new HttpsError('already-exists', 'Already booked this event')
      }

      // Get user profile
      const userDoc = await transaction.get(db.collection('users').doc(userId))
      const userProfile = userDoc.data() || {}

      // Create booking
      const bookingData = {
        eventId,
        userId,
        userEmail: request.auth.token.email || '',
        userDisplayName: userProfile.displayName || request.auth.token.name || '',
        eventTitle: event.title,
        eventDate: event.start,
        eventStartTime: event.start,
        eventEndTime: event.end,
        userNotes: sanitizeInput(userNotes || '', 500),
        status: 'confirmed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      const bookingRef = db.collection('bookings').doc()
      transaction.set(bookingRef, bookingData)

      // Update event spots atomically
      transaction.update(eventRef, {
        spotsBooked: admin.firestore.FieldValue.increment(1),
        spotsAvailable: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      return { bookingId: bookingRef.id, eventTitle: event.title }
    })

    logger.info('Booking created', { userId, eventId })
    return result
  } catch (error) {
    logger.error('Booking error', { userId, eventId, error: error.message })
    if (error instanceof HttpsError) {
      throw error
    }
    throw new HttpsError('internal', 'Failed to process booking')
  }
})

/**
 * Cloud Function: Cancel Event Booking
 * Handles cancellation and spot restoration
 */
exports.cancelEventBooking = onCall(async (request) => {
  const { bookingId } = request.data
  const userId = request.auth?.uid

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  const db = admin.firestore()

  try {
    await db.runTransaction(async (transaction) => {
      const bookingRef = db.collection('bookings').doc(bookingId)
      const bookingDoc = await transaction.get(bookingRef)

      if (!bookingDoc.exists) {
        throw new HttpsError('not-found', 'Booking not found')
      }

      const booking = bookingDoc.data()

      // Check authorization
      const userDoc = await transaction.get(db.collection('users').doc(userId))
      const isAdmin = userDoc.data()?.role === 'admin'

      if (booking.userId !== userId && !isAdmin) {
        throw new HttpsError('permission-denied', 'Not authorized')
      }

      if (booking.status === 'cancelled') {
        throw new HttpsError('failed-precondition', 'Already cancelled')
      }

      // Update booking
      transaction.update(bookingRef, {
        status: 'cancelled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      // Restore event spots
      const eventRef = db.collection('volunteerEvents').doc(booking.eventId)
      transaction.update(eventRef, {
        spotsBooked: admin.firestore.FieldValue.increment(-1),
        spotsAvailable: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    logger.info('Booking cancelled', { userId, bookingId })
    return { success: true, message: 'Booking cancelled successfully' }
  } catch (error) {
    logger.error('Cancel error', { userId, bookingId, error: error.message })
    if (error instanceof HttpsError) {
      throw error
    }
    throw new HttpsError('internal', 'Failed to cancel booking')
  }
})

/**
 * Cloud Function: Process Donation
 * Validates and records donation
 */
exports.processDonation = onCall(async (request) => {
  const { amount, message } = request.data
  const userId = request.auth?.uid

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  if (!amount || amount < 1 || amount > 100000 || typeof amount !== 'number') {
    throw new HttpsError('invalid-argument', 'Invalid donation amount (must be between 1-100000)')
  }

  const db = admin.firestore()

  try {
    const userDoc = await db.collection('users').doc(userId).get()
    const userProfile = userDoc.data() || {}

    const donationData = {
      userId,
      amount: parseFloat(amount),
      message: sanitizeInput(message || '', 500),
      userEmail: request.auth.token.email || '',
      displayName: userProfile.displayName || request.auth.token.name || 'User',
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const donationRef = await db.collection('donations').add(donationData)

    logger.info('Donation processed', { userId, amount, donationId: donationRef.id })

    return {
      success: true,
      donationId: donationRef.id,
      message: 'Thank you for your donation!',
    }
  } catch (error) {
    logger.error('Donation error', { userId, amount, error: error.message })
    throw new HttpsError('internal', 'Failed to process donation')
  }
})

/**
 * Scheduled Function: Clean up past events
 * Runs daily at 2 AM to deactivate events that have ended
 */
exports.cleanupPastEvents = onSchedule('0 2 * * *', async () => {
  const db = admin.firestore()
  const now = new Date()

  try {
    const pastEvents = await db
      .collection('volunteerEvents')
      .where('isActive', '==', true)
      .where('end', '<', now)
      .get()

    const batch = db.batch()
    let count = 0

    pastEvents.forEach((doc) => {
      batch.update(doc.ref, {
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      count++
    })

    if (count > 0) {
      await batch.commit()
      logger.info(`Deactivated ${count} past events`)
    }

    return { deactivated: count }
  } catch (error) {
    logger.error('Cleanup error', error)
    throw error
  }
})
