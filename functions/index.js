/**
 * Firebase Cloud Functions for ITO5032 Web Application
 * Server-side functionality for event booking, donations, and automated tasks
 */

const { setGlobalOptions } = require('firebase-functions/v2')
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')
const logger = require('firebase-functions/logger')
const sgMail = require('@sendgrid/mail')

// Define secrets
const sendgridApiKey = defineSecret('SENDGRID_API_KEY')
const sendgridFromEmail = defineSecret('SENDGRID_FROM_EMAIL')

// Initialize Firebase Admin
admin.initializeApp()

// Global options for cost control
setGlobalOptions({ maxInstances: 10 })

/**
 * Sanitize user input to prevent XSS and injection attacks
 * Uses comprehensive HTML entity encoding and removes dangerous characters
 */
function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return ''

  return (
    input
      .trim()
      .slice(0, maxLength)
      // HTML entity encoding for dangerous characters
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Remove potential script injection patterns
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  )
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

/**
 * Helper: Format date for email display
 */
function formatDateForEmail(timestamp) {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Helper: Send email via SendGrid
 */
async function sendEmail({ to, subject, html, apiKey, fromEmail }) {
  if (!apiKey) {
    throw new Error('SendGrid not configured')
  }

  sgMail.setApiKey(apiKey)

  const msg = {
    to,
    from: fromEmail || 'noreply@example.com',
    subject,
    html,
  }

  try {
    await sgMail.send(msg)
    logger.info('Email sent', { to, subject })
  } catch (error) {
    logger.error('Email send error', {
      to,
      subject,
      error: error.message,
      code: error.code,
      response: error.response?.body,
    })
    // Provide more specific error messages
    if (error.code === 401 || error.code === 403) {
      throw new Error('SendGrid authentication failed. Please check API key.')
    } else if (error.code === 400) {
      throw new Error(
        'Invalid email configuration. Please verify sender email is verified in SendGrid.',
      )
    }
    throw new Error(`Email delivery failed: ${error.message}`)
  }
}

/**
 * Cloud Function: Send Bulk Email (Admin Only)
 * Allows admins to send emails to multiple users
 */
exports.sendBulkEmail = onCall(
  { secrets: [sendgridApiKey, sendgridFromEmail] },
  async (request) => {
    const { recipients, subject, message } = request.data
    const userId = request.auth?.uid

    if (!userId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated')
    }

    const db = admin.firestore()

    // Verify admin role
    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required')
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new HttpsError('invalid-argument', 'Recipients array required')
    }

    if (recipients.length > 100) {
      throw new HttpsError('invalid-argument', 'Maximum 100 recipients allowed')
    }

    if (!subject || !message) {
      throw new HttpsError('invalid-argument', 'Subject and message required')
    }

    const sanitizedSubject = sanitizeInput(subject, 200)
    const sanitizedMessage = sanitizeInput(message, 5000)

    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #198754; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>ITO5032 Web - Community Update</h2>
          </div>
          <div class="content">
            ${sanitizedMessage.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>This is an automated message from ITO5032 Web Application</p>
          </div>
        </div>
      </body>
    </html>
  `

    const results = { sent: 0, failed: 0, errors: [] }

    for (const email of recipients) {
      try {
        await sendEmail({
          to: email,
          subject: sanitizedSubject,
          html: emailHtml,
          apiKey: sendgridApiKey.value(),
          fromEmail: sendgridFromEmail.value(),
        })
        results.sent++
      } catch (error) {
        results.failed++
        results.errors.push({ email, error: error.message })
      }
    }

    logger.info('Bulk email completed', { userId, sent: results.sent, failed: results.failed })

    return {
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    }
  },
)

/**
 * Cloud Function: Send Booking Summary Email
 * Sends user their booking history
 */
exports.sendBookingSummary = onCall(
  { secrets: [sendgridApiKey, sendgridFromEmail] },
  async (request) => {
    const userId = request.auth?.uid

    if (!userId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated')
    }

    const db = admin.firestore()

    try {
      const userDoc = await db.collection('users').doc(userId).get()
      const userEmail = request.auth.token.email
      const userName = userDoc.data()?.displayName || request.auth.token.name || 'User'

      if (!userEmail) {
        throw new HttpsError('failed-precondition', 'User email not found')
      }

      // Get all bookings for user
      const bookingsSnapshot = await db
        .collection('bookings')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get()

      const bookings = bookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      let bookingsHtml = '<p>No bookings found.</p>'

      if (bookings.length > 0) {
        const confirmedBookings = bookings.filter((b) => b.status === 'confirmed')
        const cancelledBookings = bookings.filter((b) => b.status === 'cancelled')

        bookingsHtml = `
        <h3>Confirmed Bookings (${confirmedBookings.length})</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #e9ecef;">
            <th style="padding: 10px; text-align: left;">Event</th>
            <th style="padding: 10px; text-align: left;">Date</th>
            <th style="padding: 10px; text-align: left;">Status</th>
          </tr>
          ${confirmedBookings
            .map(
              (b) => `
            <tr style="border-bottom: 1px solid #dee2e6;">
              <td style="padding: 10px;">${b.eventTitle}</td>
              <td style="padding: 10px;">${formatDateForEmail(b.eventStartTime)}</td>
              <td style="padding: 10px;"><span style="color: #198754;">✓ Confirmed</span></td>
            </tr>
          `,
            )
            .join('')}
        </table>

        ${
          cancelledBookings.length > 0
            ? `
        <h3 style="margin-top: 30px;">Cancelled Bookings (${cancelledBookings.length})</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #e9ecef;">
            <th style="padding: 10px; text-align: left;">Event</th>
            <th style="padding: 10px; text-align: left;">Date</th>
          </tr>
          ${cancelledBookings
            .map(
              (b) => `
            <tr style="border-bottom: 1px solid #dee2e6;">
              <td style="padding: 10px;">${b.eventTitle}</td>
              <td style="padding: 10px;">${formatDateForEmail(b.eventStartTime)}</td>
            </tr>
          `,
            )
            .join('')}
        </table>
        `
            : ''
        }
      `
      }

      const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #198754; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f9fa; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Your Booking Summary</h2>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Here is your complete booking history:</p>
              ${bookingsHtml}
            </div>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString('en-AU')}</p>
            </div>
          </div>
        </body>
      </html>
    `

      await sendEmail({
        to: userEmail,
        subject: 'Your Booking Summary - ITO5032 Web',
        html: emailHtml,
        apiKey: sendgridApiKey.value(),
        fromEmail: sendgridFromEmail.value(),
      })

      logger.info('Booking summary sent', { userId })

      return {
        success: true,
        message: `Booking summary sent to ${userEmail}`,
        bookingsCount: bookings.length,
      }
    } catch (error) {
      logger.error('Send booking summary error', {
        userId,
        error: error.message,
        stack: error.stack,
      })
      if (error instanceof HttpsError) {
        throw error
      }
      throw new HttpsError('internal', `Failed to send booking summary: ${error.message}`)
    }
  },
)

/**
 * Cloud Function: Send Donation Summary Email
 * Sends user their donation history
 */
exports.sendDonationSummary = onCall(
  { secrets: [sendgridApiKey, sendgridFromEmail] },
  async (request) => {
    const userId = request.auth?.uid

    if (!userId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated')
    }

    const db = admin.firestore()

    try {
      const userDoc = await db.collection('users').doc(userId).get()
      const userEmail = request.auth.token.email
      const userName = userDoc.data()?.displayName || request.auth.token.name || 'User'

      if (!userEmail) {
        throw new HttpsError('failed-precondition', 'User email not found')
      }

      // Get all donations for user
      const donationsSnapshot = await db
        .collection('donations')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get()

      const donations = donationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      const totalDonated = donations.reduce((sum, d) => sum + (d.amount || 0), 0)

      let donationsHtml = '<p>No donations found.</p>'

      if (donations.length > 0) {
        donationsHtml = `
        <div style="background-color: #d1e7dd; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h3 style="margin: 0; color: #0f5132;">Total Donated: $${totalDonated.toFixed(2)}</h3>
          <p style="margin: 5px 0 0 0; color: #0f5132;">Thank you for your ${donations.length} donation(s)!</p>
        </div>

        <h3>Donation History</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #e9ecef;">
            <th style="padding: 10px; text-align: left;">Date</th>
            <th style="padding: 10px; text-align: left;">Amount</th>
            <th style="padding: 10px; text-align: left;">Message</th>
          </tr>
          ${donations
            .map(
              (d) => `
            <tr style="border-bottom: 1px solid #dee2e6;">
              <td style="padding: 10px;">${formatDateForEmail(d.createdAt)}</td>
              <td style="padding: 10px; font-weight: bold;">$${d.amount.toFixed(2)}</td>
              <td style="padding: 10px;">${d.message || '-'}</td>
            </tr>
          `,
            )
            .join('')}
        </table>
      `
      }

      const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #198754; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f9fa; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Your Donation Summary</h2>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Here is your complete donation history:</p>
              ${donationsHtml}
            </div>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString('en-AU')}</p>
            </div>
          </div>
        </body>
      </html>
    `

      await sendEmail({
        to: userEmail,
        subject: 'Your Donation Summary - ITO5032 Web',
        html: emailHtml,
        apiKey: sendgridApiKey.value(),
        fromEmail: sendgridFromEmail.value(),
      })

      logger.info('Donation summary sent', { userId, totalDonated })

      return {
        success: true,
        message: `Donation summary sent to ${userEmail}`,
        donationsCount: donations.length,
        totalDonated,
      }
    } catch (error) {
      logger.error('Send donation summary error', {
        userId,
        error: error.message,
        stack: error.stack,
      })
      if (error instanceof HttpsError) {
        throw error
      }
      throw new HttpsError('internal', `Failed to send donation summary: ${error.message}`)
    }
  },
)

/**
 * Cloud Function: Send Upcoming Events Email
 * Sends user their upcoming event bookings
 */
exports.sendUpcomingEvents = onCall(
  { secrets: [sendgridApiKey, sendgridFromEmail] },
  async (request) => {
    const userId = request.auth?.uid

    if (!userId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated')
    }

    const db = admin.firestore()

    try {
      const userDoc = await db.collection('users').doc(userId).get()
      const userEmail = request.auth.token.email
      const userName = userDoc.data()?.displayName || request.auth.token.name || 'User'

      if (!userEmail) {
        throw new HttpsError('failed-precondition', 'User email not found')
      }

      const now = new Date()

      // Get upcoming confirmed bookings
      const bookingsSnapshot = await db
        .collection('bookings')
        .where('userId', '==', userId)
        .where('status', '==', 'confirmed')
        .where('eventStartTime', '>', now)
        .orderBy('eventStartTime', 'asc')
        .get()

      const upcomingBookings = bookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      let eventsHtml = '<p>You have no upcoming events.</p>'

      if (upcomingBookings.length > 0) {
        eventsHtml = `
        <div style="background-color: #cfe2ff; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h3 style="margin: 0; color: #084298;">You have ${upcomingBookings.length} upcoming event(s)</h3>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #e9ecef;">
            <th style="padding: 10px; text-align: left;">Event</th>
            <th style="padding: 10px; text-align: left;">Date & Time</th>
            <th style="padding: 10px; text-align: left;">Notes</th>
          </tr>
          ${upcomingBookings
            .map(
              (b) => `
            <tr style="border-bottom: 1px solid #dee2e6;">
              <td style="padding: 10px; font-weight: bold;">${b.eventTitle}</td>
              <td style="padding: 10px;">${formatDateForEmail(b.eventStartTime)}</td>
              <td style="padding: 10px;">${b.userNotes || '-'}</td>
            </tr>
          `,
            )
            .join('')}
        </table>
      `
      }

      const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #198754; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f9fa; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Your Upcoming Events</h2>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Here are your upcoming volunteer events:</p>
              ${eventsHtml}
            </div>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString('en-AU')}</p>
            </div>
          </div>
        </body>
      </html>
    `

      await sendEmail({
        to: userEmail,
        subject: 'Your Upcoming Events - ITO5032 Web',
        html: emailHtml,
        apiKey: sendgridApiKey.value(),
        fromEmail: sendgridFromEmail.value(),
      })

      logger.info('Upcoming events sent', { userId, count: upcomingBookings.length })

      return {
        success: true,
        message: `Upcoming events sent to ${userEmail}`,
        eventsCount: upcomingBookings.length,
      }
    } catch (error) {
      logger.error('Send upcoming events error', {
        userId,
        error: error.message,
        stack: error.stack,
      })
      if (error instanceof HttpsError) {
        throw error
      }
      throw new HttpsError('internal', `Failed to send upcoming events: ${error.message}`)
    }
  },
)
