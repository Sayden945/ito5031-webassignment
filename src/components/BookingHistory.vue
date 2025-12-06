<template>
  <div class="booking-history mt-5">
    <h3 class="mb-4">Volunteer Booking History</h3>

    <!-- Search filters per column -->
    <div class="row g-2 mb-3">
      <div class="col-12 col-sm-6 col-md-4">
        <label class="form-label small mb-1">Event</label>
        <input
          v-model="searchFilters.eventTitle"
          type="text"
          class="form-control form-control-sm"
          placeholder="Search event..."
        />
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <label class="form-label small mb-1">Status</label>
        <input
          v-model="searchFilters.status"
          type="text"
          class="form-control form-control-sm"
          placeholder="Search status..."
        />
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <label class="form-label small mb-1">Date Range</label>
        <div class="d-flex gap-1">
          <input
            v-model="dateRange.start"
            type="date"
            class="form-control form-control-sm"
            placeholder="From"
          />
          <input
            v-model="dateRange.end"
            type="date"
            class="form-control form-control-sm"
            placeholder="To"
          />
        </div>
        <button
          v-if="dateRange.start || dateRange.end"
          @click="clearDateRange"
          class="btn btn-sm btn-outline-secondary mt-1 w-100"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Loading and error states -->
    <div v-if="bookingStore.loading" class="text-center py-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="bookingStore.error" class="alert alert-danger">
      {{ bookingStore.error }}
    </div>

    <!-- Table -->
    <div v-else class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th @click="sortBy('eventTitle')" class="sortable text-center">
              Event
              <i
                class="bi"
                :class="{
                  'bi-sort-down': sortColumn === 'eventTitle' && sortDirection === 'asc',
                  'bi-sort-up': sortColumn === 'eventTitle' && sortDirection === 'desc',
                  'bi-arrow-down-up': sortColumn !== 'eventTitle',
                }"
              ></i>
            </th>
            <th @click="sortBy('status')" class="sortable text-center">
              Status
              <i
                class="bi"
                :class="{
                  'bi-sort-down': sortColumn === 'status' && sortDirection === 'asc',
                  'bi-sort-up': sortColumn === 'status' && sortDirection === 'desc',
                  'bi-arrow-down-up': sortColumn !== 'status',
                }"
              ></i>
            </th>
            <th @click="sortBy('eventDate')" class="sortable text-center">
              Event Date
              <i
                class="bi"
                :class="{
                  'bi-sort-down': sortColumn === 'eventDate' && sortDirection === 'asc',
                  'bi-sort-up': sortColumn === 'eventDate' && sortDirection === 'desc',
                  'bi-arrow-down-up': sortColumn !== 'eventDate',
                }"
              ></i>
            </th>
            <th class="text-center">Start Time</th>
            <th class="text-center">End Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td colspan="5" class="text-center text-muted py-4">No bookings found</td>
          </tr>
          <tr v-for="booking in paginatedData" :key="booking.id">
            <td class="text-center">
              <strong>{{ booking.eventTitle }}</strong>
            </td>
            <td class="text-center">
              <span
                class="badge"
                :class="{
                  'bg-success': booking.status === 'confirmed',
                  'bg-warning text-dark': booking.status === 'pending',
                  'bg-danger': booking.status === 'cancelled',
                  'bg-secondary': booking.status === 'completed',
                }"
              >
                {{ booking.status }}
              </span>
            </td>
            <td class="text-center">{{ formatDate(booking.eventDate) }}</td>
            <td class="text-center">{{ formatTime(booking.eventStartTime) }}</td>
            <td class="text-center">{{ formatTime(booking.eventEndTime) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination controls -->
      <nav v-if="totalPages > 1" aria-label="Booking history pagination">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              Previous
            </a>
          </li>
          <li
            v-for="page in displayedPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
          </li>
        </ul>
      </nav>

      <!-- Summary info -->
      <div class="text-muted small text-center">
        Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredData.length) }} of
        {{ filteredData.length }} bookings
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBookingStore } from '@/stores/bookingStore'

const bookingStore = useBookingStore()

// Search filters for each column
const searchFilters = ref({
  eventTitle: '',
  status: '',
})

// Date range filter
const dateRange = ref({
  start: '',
  end: '',
})

// Sorting state
const sortColumn = ref('eventDate')
const sortDirection = ref('desc')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 10

// Load bookings on mount
onMounted(async () => {
  await bookingStore.fetchBookings()
})

// Filtered data based on search filters
const filteredData = computed(() => {
  let data = [...bookingStore.userBookings]

  // Filter by event title
  if (searchFilters.value.eventTitle) {
    data = data.filter((booking) =>
      booking.eventTitle.toLowerCase().includes(searchFilters.value.eventTitle.toLowerCase()),
    )
  }

  // Filter by status
  if (searchFilters.value.status) {
    data = data.filter((booking) =>
      booking.status.toLowerCase().includes(searchFilters.value.status.toLowerCase()),
    )
  }

  // Filter by date range
  if (dateRange.value.start || dateRange.value.end) {
    data = data.filter((booking) => {
      if (!booking.eventDate) return false
      const eventDate = new Date(booking.eventDate)
      eventDate.setHours(0, 0, 0, 0)

      if (dateRange.value.start && dateRange.value.end) {
        const startDate = new Date(dateRange.value.start)
        const endDate = new Date(dateRange.value.end)
        endDate.setHours(23, 59, 59, 999)
        return eventDate >= startDate && eventDate <= endDate
      } else if (dateRange.value.start) {
        const startDate = new Date(dateRange.value.start)
        return eventDate >= startDate
      } else if (dateRange.value.end) {
        const endDate = new Date(dateRange.value.end)
        endDate.setHours(23, 59, 59, 999)
        return eventDate <= endDate
      }
      return true
    })
  }

  return data
})

// Sorted data
const sortedData = computed(() => {
  const data = [...filteredData.value]

  data.sort((a, b) => {
    let aVal = a[sortColumn.value]
    let bVal = b[sortColumn.value]

    // Handle different data types
    if (sortColumn.value === 'spotsBooked') {
      aVal = parseInt(aVal)
      bVal = parseInt(bVal)
    } else if (sortColumn.value === 'eventDate') {
      aVal = aVal ? new Date(aVal).getTime() : 0
      bVal = bVal ? new Date(bVal).getTime() : 0
    } else {
      aVal = aVal ? aVal.toString().toLowerCase() : ''
      bVal = bVal ? bVal.toString().toLowerCase() : ''
    }

    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })

  return data
})

// Paginated data
const totalPages = computed(() => Math.ceil(sortedData.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)

const paginatedData = computed(() => {
  return sortedData.value.slice(startIndex.value, endIndex.value)
})

// Display page numbers (show max 5 pages at a time)
const displayedPages = computed(() => {
  const pages = []
  const maxPagesToShow = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2))
  let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1)

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// Sort function
const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  currentPage.value = 1 // Reset to first page when sorting
}

// Page change function
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Clear date range
const clearDateRange = () => {
  dateRange.value.start = ''
  dateRange.value.end = ''
  currentPage.value = 1
}

// Format date helper
const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return 'Invalid Date'
    return d.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

// Format time helper
const formatTime = (date) => {
  if (!date) return 'N/A'
  try {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return 'Invalid Time'
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid Time'
  }
}
</script>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sortable i {
  margin-left: 5px;
  font-size: 0.8em;
}

.table-responsive {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.pagination {
  margin-top: 20px;
}

.badge {
  font-size: 0.85rem;
  padding: 0.4em 0.6em;
}
</style>
