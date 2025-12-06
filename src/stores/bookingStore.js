import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/userStore'

export const useBookingStore = defineStore('booking', () => {
  const userStore = useUserStore()
  const events = ref([])
  const bookings = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed getters
  const availableEvents = computed(() =>
    events.value.filter(
      (event) => event.isActive && event.spotsAvailable > 0 && new Date(event.start) > new Date(),
    ),
  )

  const userBookings = computed(() => {
    if (!userStore.user) return []

    return bookings.value.filter((booking) => booking.userId === userStore.user.uid)
  })

  // Actions
  const fetchEvents = async () => {
    loading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'volunteerEvents'),
        where('isActive', '==', true),
        orderBy('start', 'asc'),
      )
      const querySnapshot = await getDocs(q)

      events.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        start: doc.data().start?.toDate?.() || new Date(doc.data().start),
        end: doc.data().end?.toDate?.() || new Date(doc.data().end),
      }))
    } catch (err) {
      error.value = `Failed to fetch events: ${err.message}`
      console.error('Error fetching events:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchBookings = async () => {
    loading.value = true
    error.value = null

    try {
      let q
      // Admin can see all bookings, regular users only see their own
      if (userStore.isAdmin) {
        q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
      } else if (userStore.user?.uid) {
        q = query(
          collection(db, 'bookings'),
          where('userId', '==', userStore.user.uid),
          orderBy('createdAt', 'desc'),
        )
      } else {
        // Not authenticated, set empty bookings
        bookings.value = []
        return
      }

      const querySnapshot = await getDocs(q)

      bookings.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        eventDate: doc.data().eventDate?.toDate?.() || new Date(doc.data().eventDate),
        eventStartTime:
          doc.data().eventStartTime?.toDate?.() || new Date(doc.data().eventStartTime),
        eventEndTime: doc.data().eventEndTime?.toDate?.() || new Date(doc.data().eventEndTime),
      }))
    } catch (err) {
      error.value = `Failed to fetch bookings: ${err.message}`
      console.error('Error fetching bookings:', err)
    } finally {
      loading.value = false
    }
  }

  const createEvent = async (eventData) => {
    try {
      const docRef = await addDoc(collection(db, 'volunteerEvents'), {
        ...eventData,
        start: eventData.start,
        end: eventData.end,
        spotsTotal: eventData.spotsTotal || 10,
        spotsBooked: 0,
        spotsAvailable: eventData.spotsTotal || 10,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const newEvent = {
        id: docRef.id,
        ...eventData,
        spotsBooked: 0,
        spotsAvailable: eventData.spotsTotal || 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      events.value.push(newEvent)
      return docRef.id
    } catch (err) {
      error.value = `Failed to create event: ${err.message}`
      throw err
    }
  }

  const bookEvent = async (eventId, userNotes = '') => {
    const userStore = useUserStore()
    if (!userStore.user) {
      throw new Error('User must be logged in to book events')
    }

    try {
      // Check if user already has an active (confirmed) booking for this event
      const existingBooking = bookings.value.find(
        (booking) =>
          booking.eventId === eventId &&
          booking.userId === userStore.user.uid &&
          booking.status === 'confirmed',
      )

      if (existingBooking) {
        throw new Error('You have already booked this event')
      }

      // Check if event has available spots
      const event = events.value.find((e) => e.id === eventId)
      if (!event || event.spotsAvailable <= 0) {
        throw new Error('No spots available for this event')
      }

      // Check for time conflicts (only with confirmed bookings)
      const conflictingBooking = userBookings.value.find((booking) => {
        if (booking.status !== 'confirmed') return false

        const bookingEvent = events.value.find((e) => e.id === booking.eventId)
        if (!bookingEvent) return false

        return (
          (event.start >= bookingEvent.start && event.start < bookingEvent.end) ||
          (event.end > bookingEvent.start && event.end <= bookingEvent.end) ||
          (event.start <= bookingEvent.start && event.end >= bookingEvent.end)
        )
      })

      if (conflictingBooking) {
        throw new Error('You have a conflicting booking at this time')
      }

      // Create booking
      const bookingData = {
        eventId,
        userId: userStore.user.uid,
        userEmail: userStore.user.email,
        userDisplayName: userStore.userProfile?.displayName || userStore.user.displayName,
        eventTitle: event.title,
        eventDate: event.start,
        eventStartTime: event.start,
        eventEndTime: event.end,
        userNotes,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'bookings'), bookingData)

      // Update event spots
      const eventRef = doc(db, 'volunteerEvents', eventId)
      await updateDoc(eventRef, {
        spotsBooked: event.spotsBooked + 1,
        spotsAvailable: event.spotsAvailable - 1,
        updatedAt: serverTimestamp(),
      })

      // Update local state
      const newBooking = {
        id: docRef.id,
        ...bookingData,
        createdAt: new Date(),
        eventDate: event.start,
        eventStartTime: event.start,
        eventEndTime: event.end,
      }
      bookings.value.push(newBooking)

      const eventIndex = events.value.findIndex((e) => e.id === eventId)
      if (eventIndex !== -1) {
        events.value[eventIndex].spotsBooked += 1
        events.value[eventIndex].spotsAvailable -= 1
      }

      return docRef.id
    } catch (err) {
      error.value = `Failed to book event: ${err.message}`
      throw err
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      const booking = bookings.value.find((b) => b.id === bookingId)
      if (!booking) {
        throw new Error('Booking not found')
      }

      // Update booking status to cancelled instead of deleting
      const bookingRef = doc(db, 'bookings', bookingId)
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
      })

      // Update event spots
      const eventRef = doc(db, 'volunteerEvents', booking.eventId)
      const event = events.value.find((e) => e.id === booking.eventId)
      if (event) {
        await updateDoc(eventRef, {
          spotsBooked: event.spotsBooked - 1,
          spotsAvailable: event.spotsAvailable + 1,
          updatedAt: serverTimestamp(),
        })

        // Update local state
        const eventIndex = events.value.findIndex((e) => e.id === booking.eventId)
        if (eventIndex !== -1) {
          events.value[eventIndex].spotsBooked -= 1
          events.value[eventIndex].spotsAvailable += 1
        }
      }

      // Update booking status in local state
      const bookingIndex = bookings.value.findIndex((b) => b.id === bookingId)
      if (bookingIndex !== -1) {
        bookings.value[bookingIndex].status = 'cancelled'
        bookings.value[bookingIndex].cancelledAt = new Date()
      }
    } catch (err) {
      error.value = `Failed to cancel booking: ${err.message}`
      throw err
    }
  }

  const updateEvent = async (eventId, updates) => {
    try {
      const eventRef = doc(db, 'volunteerEvents', eventId)
      await updateDoc(eventRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      const index = events.value.findIndex((event) => event.id === eventId)
      if (index !== -1) {
        events.value[index] = {
          ...events.value[index],
          ...updates,
          updatedAt: new Date(),
        }
      }
    } catch (err) {
      error.value = `Failed to update event: ${err.message}`
      throw err
    }
  }

  const deleteEvent = async (eventId) => {
    try {
      // Check if event has any bookings
      const eventBookings = bookings.value.filter(
        (b) => b.eventId === eventId && b.status === 'confirmed',
      )
      if (eventBookings.length > 0) {
        throw new Error(
          'Cannot delete event with active bookings. Please cancel all bookings first.',
        )
      }

      await deleteDoc(doc(db, 'volunteerEvents', eventId))
      events.value = events.value.filter((event) => event.id !== eventId)
    } catch (err) {
      error.value = `Failed to delete event: ${err.message}`
      throw err
    }
  }

  const deleteBooking = async (bookingId) => {
    try {
      const booking = bookings.value.find((b) => b.id === bookingId)
      if (!booking) {
        throw new Error('Booking not found')
      }

      // Update event spots if booking was confirmed
      if (booking.status === 'confirmed') {
        const eventRef = doc(db, 'volunteerEvents', booking.eventId)
        const event = events.value.find((e) => e.id === booking.eventId)
        if (event) {
          await updateDoc(eventRef, {
            spotsBooked: event.spotsBooked - 1,
            spotsAvailable: event.spotsAvailable + 1,
            updatedAt: serverTimestamp(),
          })

          // Update local state
          const eventIndex = events.value.findIndex((e) => e.id === booking.eventId)
          if (eventIndex !== -1) {
            events.value[eventIndex].spotsBooked -= 1
            events.value[eventIndex].spotsAvailable += 1
          }
        }
      }

      // Delete booking document
      await deleteDoc(doc(db, 'bookings', bookingId))
      bookings.value = bookings.value.filter((b) => b.id !== bookingId)
    } catch (err) {
      error.value = `Failed to delete booking: ${err.message}`
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    events,
    bookings,
    loading,
    error,
    availableEvents,
    userBookings,
    fetchEvents,
    fetchBookings,
    createEvent,
    updateEvent,
    deleteEvent,
    bookEvent,
    cancelBooking,
    deleteBooking,
    clearError,
  }
})
