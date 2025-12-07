<template>
  <div class="container-fluid py-4">
    <div class="row">
      <!-- Calendar Column -->
      <div class="col-lg-8">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">
              <i class="bi bi-calendar-event me-2"></i>
              Volunteer Events Calendar
            </h4>
          </div>
          <div class="card-body p-0">
            <!-- Loading State -->
            <div v-if="bookingStore.loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3 text-muted">Loading events...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="bookingStore.error" class="alert alert-danger m-3" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ bookingStore.error }}
              <button class="btn btn-sm btn-outline-danger ms-2" @click="bookingStore.clearError()">
                Dismiss
              </button>
            </div>

            <!-- Calendar -->
            <div v-else class="calendar-container">
              <FullCalendar
                ref="fullCalendar"
                :options="calendarOptions"
                @event-click="handleEventClick"
                @date-select="handleDateSelect"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <!-- User Bookings -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-person-check me-2"></i>
              My Bookings
            </h5>
          </div>
          <div class="card-body">
            <div v-if="!userStore.isAuthenticated" class="text-center text-muted">
              <i class="bi bi-person-x display-6 mb-3"></i>
              <p>Please log in to view your bookings</p>
              <router-link :to="{ name: 'login' }" class="btn btn-outline-primary">
                Sign In
              </router-link>
            </div>

            <div v-else-if="activeUserBookings.length === 0" class="text-center text-muted">
              <i class="bi bi-calendar-x display-6 mb-3"></i>
              <p>No bookings yet</p>
            </div>

            <div v-else>
              <div
                v-for="booking in activeUserBookings"
                :key="booking.id"
                class="border rounded p-3 mb-2"
              >
                <h6 class="text-primary">{{ booking.eventTitle }}</h6>
                <p class="text-muted mb-2">
                  <i class="bi bi-calendar me-1"></i>
                  {{ formatEventDate(booking.eventDate) }}
                </p>
                <p class="text-muted mb-2">
                  <i class="bi bi-check-circle me-1"></i>
                  {{ booking.status }}
                </p>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="cancelUserBooking(booking.id)"
                  :disabled="bookingStore.loading"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Events -->
        <div class="card shadow-sm border-0">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">
              <i class="bi bi-calendar-plus me-2"></i>
              Upcoming Events
            </h5>
          </div>
          <div class="card-body">
            <div v-if="bookingStore.availableEvents.length === 0" class="text-center text-muted">
              <i class="bi bi-calendar-x display-6 mb-3"></i>
              <p>No upcoming events</p>
            </div>

            <div v-else>
              <div
                v-for="event in bookingStore.availableEvents.slice(0, 5)"
                :key="event.id"
                class="border rounded p-3 mb-2"
              >
                <h6 class="text-info">{{ event.title }}</h6>
                <p class="text-muted mb-2">
                  <i class="bi bi-calendar me-1"></i>
                  {{ formatEventDate(event.start) }}
                </p>
                <p v-if="event.location" class="text-muted mb-2 small">
                  <i class="bi bi-geo-alt me-1"></i>
                  {{ event.location }}
                </p>
                <p class="text-muted mb-2">
                  <i class="bi bi-people me-1"></i>
                  {{ event.spotsAvailable }} / {{ event.spotsTotal }} spots available
                </p>
                <button
                  class="btn btn-sm btn-info"
                  @click="quickBookEvent(event)"
                  :disabled="!userStore.isAuthenticated || bookingStore.loading"
                >
                  Quick Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div class="modal fade" id="eventModal" tabindex="-1" ref="eventModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedEvent?.title }}</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body" v-if="selectedEvent">
            <div class="mb-3">
              <strong>Date & Time:</strong><br />
              {{ formatEventDate(selectedEvent.start) }}
              <span v-if="selectedEvent.end"> - {{ formatEventTime(selectedEvent.end) }} </span>
            </div>

            <div class="mb-3" v-if="selectedEvent.extendedProps?.location">
              <strong>Location:</strong><br />
              {{ selectedEvent.extendedProps.location }}
            </div>

            <div class="mb-3" v-if="selectedEvent.extendedProps?.description">
              <strong>Description:</strong><br />
              {{ selectedEvent.extendedProps.description }}
            </div>

            <div class="mb-3">
              <strong>Availability:</strong><br />
              <span
                class="badge"
                :class="
                  selectedEvent.extendedProps?.spotsAvailable > 0 ? 'bg-success' : 'bg-danger'
                "
              >
                {{ selectedEvent.extendedProps?.spotsAvailable || 0 }} /
                {{ selectedEvent.extendedProps?.spotsTotal || 0 }} spots available
              </span>
            </div>

            <!-- Booking Notes -->
            <div
              class="mb-3"
              v-if="userStore.isAuthenticated && selectedEvent.extendedProps?.spotsAvailable > 0"
            >
              <label for="bookingNotes" class="form-label">Notes (optional):</label>
              <textarea
                id="bookingNotes"
                class="form-control"
                rows="3"
                v-model="bookingNotes"
                placeholder="Any special requests or notes..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button
              v-if="userStore.isAuthenticated && selectedEvent?.extendedProps?.spotsAvailable > 0"
              type="button"
              class="btn btn-primary"
              @click="bookSelectedEvent"
              :disabled="bookingStore.loading"
            >
              <span
                v-if="bookingStore.loading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              Book Event
            </button>
            <button
              v-else-if="!userStore.isAuthenticated"
              type="button"
              class="btn btn-outline-primary"
              @click="$router.push({ name: 'login' })"
            >
              Sign In to Book
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Modal } from 'bootstrap'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useBookingStore } from '@/stores/bookingStore'
import { useUserStore } from '@/stores/userStore'

const bookingStore = useBookingStore()
const userStore = useUserStore()

const fullCalendar = ref(null)
const eventModal = ref(null)
const selectedEvent = ref(null)
const bookingNotes = ref('')

// Filter out cancelled bookings
const activeUserBookings = computed(() =>
  bookingStore.userBookings.filter((booking) => booking.status !== 'cancelled'),
)

// Calendar configuration
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  height: 'auto',
  events: bookingStore.events.map((event) => ({
    id: event.id,
    title: `${event.title} (${event.spotsAvailable}/${event.spotsTotal})`,
    start: event.start,
    end: event.end,
    backgroundColor: getEventColor(event),
    borderColor: getEventColor(event),
    extendedProps: {
      description: event.description,
      location: event.location,
      longitude: event.longitude,
      latitude: event.latitude,
      spotsTotal: event.spotsTotal,
      spotsAvailable: event.spotsAvailable,
      spotsBooked: event.spotsBooked,
      category: event.category,
    },
  })),
  eventClick: handleEventClick,
  selectable: true,
  select: handleDateSelect,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
    startTime: '08:00',
    endTime: '18:00',
  },
  selectConstraint: 'businessHours',
  eventOverlap: false,
  slotMinTime: '06:00:00',
  slotMaxTime: '20:00:00',
}))

// Event color based on availability
const getEventColor = (event) => {
  if (event.spotsAvailable === 0) return '#dc3545' // Red - full
  if (event.spotsAvailable <= event.spotsTotal * 0.2) return '#fd7e14' // Orange - almost full
  return '#198754' // Green - available
}

// Event handlers
const handleEventClick = (info) => {
  selectedEvent.value = info.event
  bookingNotes.value = ''

  const modal = new Modal(eventModal.value)
  modal.show()
}

const handleDateSelect = (selectInfo) => {
  if (!userStore.isAuthenticated) {
    alert('Please sign in to create events')
    return
  }

  // This could open an admin form to create new events
  console.log('Date selected:', selectInfo)
}

const bookSelectedEvent = async () => {
  if (!selectedEvent.value) return

  try {
    await bookingStore.bookEvent(selectedEvent.value.id, bookingNotes.value)

    // Close modal
    const modal = Modal.getInstance(eventModal.value)
    modal.hide()

    // Refresh calendar
    await bookingStore.fetchEvents()

    alert('Event booked successfully!')
  } catch (error) {
    alert(error.message)
  }
}

const quickBookEvent = async (event) => {
  if (!userStore.isAuthenticated) {
    alert('Please sign in to book events')
    return
  }

  try {
    await bookingStore.bookEvent(event.id)
    alert('Event booked successfully!')
  } catch (error) {
    alert(error.message)
  }
}

const cancelUserBooking = async (bookingId) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return

  try {
    await bookingStore.cancelBooking(bookingId)
    alert('Booking cancelled successfully!')
  } catch (error) {
    alert(error.message)
  }
}

// Utility functions
const formatEventDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatEventTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Initialize data
onMounted(async () => {
  await bookingStore.fetchEvents()
  await bookingStore.fetchBookings()
})
</script>

<style scoped>
.calendar-container {
  padding: 1rem;
}

.fc-event {
  cursor: pointer;
  border-radius: 4px;
}

.fc-event:hover {
  opacity: 0.8;
}

.card-header {
  font-weight: 600;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
