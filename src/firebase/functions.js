/**
 * Firebase Cloud Functions Client
 * Wrapper functions for calling Cloud Functions from the Vue app
 */

import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { app } from '@/firebase'

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
