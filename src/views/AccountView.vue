<template>
  <div class="account-view">
    <!-- Hero Header -->
    <div class="bg-gradient text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="display-4 fw-bold mb-2">
              <i class="bi bi-person-circle me-3"></i>My Dashboard
            </h1>
            <p class="lead mb-0">
              Welcome back,
              {{ userStore.userProfile?.firstName || userStore.user?.email || 'User' }}
            </p>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <button class="btn btn-light btn-lg shadow-sm" @click="handleSignOut">
              <i class="bi bi-box-arrow-right me-2"></i>Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="container py-4">
      <!-- Quick Stats Row -->
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="card stat-card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div
                  class="stat-icon bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3"
                >
                  <i class="bi bi-calendar-check fs-3"></i>
                </div>
                <div>
                  <h6 class="text-muted mb-1">Upcoming Events</h6>
                  <h2 class="mb-0">{{ upcomingEventsCount }}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card stat-card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div
                  class="stat-icon bg-success bg-opacity-10 text-success rounded-circle p-3 me-3"
                >
                  <i class="bi bi-currency-dollar fs-3"></i>
                </div>
                <div>
                  <h6 class="text-muted mb-1">Total Donations</h6>
                  <h2 class="mb-0">${{ totalDonations }}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card stat-card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-info bg-opacity-10 text-info rounded-circle p-3 me-3">
                  <i class="bi bi-people fs-3"></i>
                </div>
                <div>
                  <h6 class="text-muted mb-1">Volunteer Hours</h6>
                  <h2 class="mb-0">{{ totalVolunteerHours }}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <ul class="nav nav-pills shadow-sm bg-white rounded p-2" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="calendar-tab"
              data-bs-toggle="pill"
              data-bs-target="#calendar"
              type="button"
              role="tab"
              @click="activeTab = 'calendar'"
            >
              <i class="bi bi-calendar-event me-2"></i>Calendar
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="donations-tab"
              data-bs-toggle="pill"
              data-bs-target="#donations"
              type="button"
              role="tab"
              @click="activeTab = 'donations'"
            >
              <i class="bi bi-heart me-2"></i>Donations
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="bookings-tab"
              data-bs-toggle="pill"
              data-bs-target="#bookings"
              type="button"
              role="tab"
              @click="activeTab = 'bookings'"
            >
              <i class="bi bi-bookmark-check me-2"></i>Bookings
            </button>
          </li>
        </ul>

        <!-- Export PDF Button -->
        <div class="d-flex gap-2">
          <div class="dropdown">
            <button
              class="btn btn-success shadow-sm px-4 py-2 dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-envelope me-2"></i>
              <span>Email Reports</span>
            </button>
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="sendBookingSummary">
                  <i class="bi bi-calendar-check me-2"></i>Booking Summary
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="sendDonationSummary">
                  <i class="bi bi-currency-dollar me-2"></i>Donation Summary
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="sendUpcomingEvents">
                  <i class="bi bi-calendar-event me-2"></i>Upcoming Events
                </a>
              </li>
            </ul>
          </div>
          <button
            class="btn btn-gradient shadow-sm px-4 py-2"
            @click="exportToPDF"
            :disabled="!canExport"
          >
            <i class="bi bi-file-earmark-pdf-fill me-2"></i>
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <div class="tab-pane fade show active" id="calendar" role="tabpanel">
          <AccountCalendar />
        </div>
        <div class="tab-pane fade" id="donations" role="tabpanel">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <DonationHistory />
            </div>
          </div>
        </div>
        <div class="tab-pane fade" id="bookings" role="tabpanel">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <BookingHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useDonationStore } from '../stores/donationStore'
import { useBookingStore } from '../stores/bookingStore'
import AccountCalendar from '@/components/AccountCalendar.vue'
import DonationHistory from '@/components/DonationHistory.vue'
import BookingHistory from '@/components/BookingHistory.vue'
import {
  sendBookingSummaryEmail,
  sendDonationSummaryEmail,
  sendUpcomingEventsEmail,
} from '@/firebase/functions'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const userStore = useUserStore()
const donationStore = useDonationStore()
const bookingStore = useBookingStore()
const router = useRouter()
const auth = getAuth()
const activeTab = ref('calendar')

// Computed stats
const totalDonations = computed(() => {
  return donationStore.userDonations
    .reduce((sum, donation) => sum + (donation.amount || 0), 0)
    .toFixed(2)
})

const upcomingEventsCount = computed(() => {
  const now = new Date()
  return bookingStore.userBookings.filter((booking) => {
    const eventDate = booking.eventDate ? new Date(booking.eventDate) : null
    return eventDate && eventDate > now && booking.status !== 'cancelled'
  }).length
})

const totalVolunteerHours = computed(() => {
  return bookingStore.userBookings
    .filter((booking) => booking.status === 'completed')
    .reduce((sum, booking) => sum + (booking.hours || 0), 0)
})

const canExport = computed(() => {
  if (activeTab.value === 'calendar') return bookingStore.events.length > 0
  if (activeTab.value === 'donations') return donationStore.userDonations.length > 0
  if (activeTab.value === 'bookings') return bookingStore.userBookings.length > 0
  return false
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const exportToPDF = () => {
  if (activeTab.value === 'calendar') exportUpcomingEventsPDF()
  else if (activeTab.value === 'donations') exportDonationsPDF()
  else if (activeTab.value === 'bookings') exportBookingsPDF()
}

const exportUpcomingEventsPDF = () => {
  const doc = new jsPDF()
  const now = new Date()
  const upcomingEvents = bookingStore.events.filter((event) => new Date(event.start) > now)

  // Header
  doc.setFontSize(20)
  doc.text('Upcoming Volunteer Events', 14, 22)
  doc.setFontSize(10)
  doc.text(`Generated: ${formatDateTime(new Date())}`, 14, 30)
  doc.text(`User: ${userStore.userProfile?.firstName || userStore.user?.email}`, 14, 36)

  // Table data
  const tableData = upcomingEvents.map((event) => [
    event.title,
    formatDateTime(event.start),
    formatDateTime(event.end),
    event.location || 'N/A',
    `${event.spotsAvailable} / ${event.spotsTotal}`,
  ])

  autoTable(doc, {
    startY: 42,
    head: [['Event', 'Start', 'End', 'Location', 'Spots Available']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [102, 126, 234] },
  })

  doc.save(`upcoming-events-${new Date().toISOString().split('T')[0]}.pdf`)
}

const exportDonationsPDF = () => {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text('Donation History', 14, 22)
  doc.setFontSize(10)
  doc.text(`Generated: ${formatDateTime(new Date())}`, 14, 30)
  doc.text(`User: ${userStore.userProfile?.firstName || userStore.user?.email}`, 14, 36)
  doc.text(`Total Donations: $${totalDonations.value}`, 14, 42)

  // Table data
  const tableData = donationStore.userDonations.map((donation) => [
    formatDate(donation.createdAt),
    `$${donation.amount.toFixed(2)}`,
    donation.status || 'Completed',
    donation.userNotes || '-',
  ])

  autoTable(doc, {
    startY: 48,
    head: [['Date', 'Amount', 'Status', 'Notes']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 167, 69] },
  })

  doc.save(`donation-history-${new Date().toISOString().split('T')[0]}.pdf`)
}

const exportBookingsPDF = () => {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text('Volunteer Booking History', 14, 22)
  doc.setFontSize(10)
  doc.text(`Generated: ${formatDateTime(new Date())}`, 14, 30)
  doc.text(`User: ${userStore.userProfile?.firstName || userStore.user?.email}`, 14, 36)
  doc.text(`Total Bookings: ${bookingStore.userBookings.length}`, 14, 42)

  // Table data
  const tableData = bookingStore.userBookings.map((booking) => [
    booking.eventTitle || 'N/A',
    formatDateTime(booking.eventDate),
    booking.status || 'N/A',
    formatDate(booking.createdAt),
    booking.userNotes || '-',
  ])

  autoTable(doc, {
    startY: 48,
    head: [['Event', 'Event Date', 'Status', 'Booked On', 'Notes']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [13, 110, 253] },
  })

  doc.save(`booking-history-${new Date().toISOString().split('T')[0]}.pdf`)
}

const handleSignOut = async () => {
  try {
    await signOut(auth)
    console.log('User signed out successfully')
    userStore.logout()
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

// Email summary functions
const sendBookingSummary = async () => {
  try {
    const result = await sendBookingSummaryEmail()
    alert(result.message || 'Booking summary sent to your email!')
  } catch (error) {
    alert('Failed to send booking summary: ' + error.message)
  }
}

const sendDonationSummary = async () => {
  try {
    const result = await sendDonationSummaryEmail()
    alert(result.message || 'Donation summary sent to your email!')
  } catch (error) {
    alert('Failed to send donation summary: ' + error.message)
  }
}

const sendUpcomingEvents = async () => {
  try {
    const result = await sendUpcomingEventsEmail()
    alert(result.message || 'Upcoming events sent to your email!')
  } catch (error) {
    alert('Failed to send upcoming events: ' + error.message)
  }
}
</script>

<style scoped>
.account-view {
  min-height: 100vh;
  background-color: #5c4de9;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-pills .nav-link {
  color: #6c757d;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-pills .nav-link:hover {
  background-color: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.nav-pills .nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card {
  border-radius: 12px;
  overflow: hidden;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

.btn-grgadient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.btn-gradient:hover:not(:disabled) {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  color: white;
}

.btn-gradient:disabled {
  background: linear-gradient(135deg, #ccc 0%, #999 100%);
  cursor: not-allowed;
  opacity: 0.6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
