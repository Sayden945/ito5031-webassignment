/**
 * Firebase Cloud Functions Client
 * Wrapper functions for calling Cloud Functions from the Vue app
 */

import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import app from '@/firebase/index.js'

const functions = getFunctions(app)

// Connect to emulator in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFunctionsEmulator(functions, 'localhost', 5001)
}

/**
 * Process event booking using Cloud Function
 * @param {string} eventId - The event ID to book
 * @param {string} userNotes - Optional notes from user
 * @returns {Promise} Booking result
 */
export const processEventBooking = async (eventId, userNotes = '') => {
  const bookEvent = httpsCallable(functions, 'processEventBooking')
  try {
    const result = await bookEvent({ eventId, userNotes })
    return result.data
  } catch (error) {
    console.error('Cloud Function error:', error)
    throw new Error(error.message || 'Failed to process booking')
  }
}

/**
 * Cancel event booking using Cloud Function
 * @param {string} bookingId - The booking ID to cancel
 * @returns {Promise} Cancellation result
 */
export const cancelEventBooking = async (bookingId) => {
  const cancelBooking = httpsCallable(functions, 'cancelEventBooking')
  try {
    const result = await cancelBooking({ bookingId })
    return result.data
  } catch (error) {
    console.error('Cloud Function error:', error)
    throw new Error(error.message || 'Failed to cancel booking')
  }
}

/**
 * Process donation using Cloud Function
 * @param {number} amount - Donation amount
 * @param {string} message - Optional message
 * @returns {Promise} Donation result
 */
export const processDonation = async (amount, message = '') => {
  const donate = httpsCallable(functions, 'processDonation')
  try {
    const result = await donate({ amount, message })
    return result.data
  } catch (error) {
    console.error('Cloud Function error:', error)
    throw new Error(error.message || 'Failed to process donation')
  }
}

/**
 * Send bulk email (Admin only)
 * @param {Object} data - Email data
 * @param {string[]} data.recipients - Array of email addresses
 * @param {string} data.subject - Email subject
 * @param {string} data.message - Email message
 * @returns {Promise} Send result
 */
export const sendBulkEmailFunction = async ({ recipients, subject, message }) => {
  const sendBulkEmail = httpsCallable(functions, 'sendBulkEmail')
  try {
    const result = await sendBulkEmail({ recipients, subject, message })
    return result.data
  } catch (error) {
    console.error('Cloud Function error:', error)
    // Extract actual error message from Firebase error
    const errorMessage = error.details?.message || error.message || 'Failed to send bulk email'
    throw new Error(errorMessage)
  }
}

/**
 * Send booking summary email to user
 * @returns {Promise} Send result
 */
export const sendBookingSummaryEmail = async () => {
  const sendSummary = httpsCallable(functions, 'sendBookingSummary')
  try {
    const result = await sendSummary()
    return result.data
  } catch (error) {
    console.error('Cloud Function error:', error)
    // Extract actual error message from Firebase error
    const errorMessage = error.details?.message || error.message || 'Failed to send booking summary'
    throw new Error(errorMessage)
  }
}

/**
 * Send donation summary email to user
 * @returns {Promise} Send result
 */
export const sendDonationSummaryEmail = async () => {
  const sendSummary = httpsCallable(functions, 'sendDonationSummary')
  try {
    const result = await sendSummary()
    return result.data
  } catch (error) {
    console.error('Cloud Function error:', error)
    // Extract actual error message from Firebase error
    const errorMessage =
      error.details?.message || error.message || 'Failed to send donation summary'
    throw new Error(errorMessage)
  }
}

/**
 * Send upcoming events email to user
 * @returns {Promise} Send result
 */
export const sendUpcomingEventsEmail = async () => {
  const sendEvents = httpsCallable(functions, 'sendUpcomingEvents')
  try {
    const result = await sendEvents()
    return result.data
  } catch (error) {
    console.error('Cloud Function error:', error)
    // Extract actual error message from Firebase error
    const errorMessage = error.details?.message || error.message || 'Failed to send upcoming events'
    throw new Error(errorMessage)
  }
}
