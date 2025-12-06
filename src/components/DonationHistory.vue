<template>
  <div class="donation-history">
    <h3 class="mb-4">Donation History</h3>

    <!-- Search filters per column -->
    <div class="row g-2 mb-3">
      <div class="col-12 col-sm-6 col-md-4">
        <label class="form-label small mb-1">Amount</label>
        <input
          v-model="searchFilters.amount"
          type="text"
          class="form-control form-control-sm"
          placeholder="Search amount..."
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
    <div v-if="donationStore.loading" class="text-center py-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="donationStore.error" class="alert alert-danger">
      {{ donationStore.error }}
    </div>

    <!-- Table -->
    <div v-else class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th @click="sortBy('amount')" class="sortable text-center">
              Amount
              <i
                class="bi"
                :class="{
                  'bi-sort-down': sortColumn === 'amount' && sortDirection === 'asc',
                  'bi-sort-up': sortColumn === 'amount' && sortDirection === 'desc',
                  'bi-arrow-down-up': sortColumn !== 'amount',
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
            <th @click="sortBy('createdAt')" class="sortable text-center">
              Date
              <i
                class="bi"
                :class="{
                  'bi-sort-down': sortColumn === 'createdAt' && sortDirection === 'asc',
                  'bi-sort-up': sortColumn === 'createdAt' && sortDirection === 'desc',
                  'bi-arrow-down-up': sortColumn !== 'createdAt',
                }"
              ></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td colspan="3" class="text-center text-muted py-4">No donations found</td>
          </tr>
          <tr v-for="donation in paginatedData" :key="donation.id">
            <td class="text-center">
              <strong>${{ donation.amount.toFixed(2) }}</strong>
            </td>
            <td class="text-center">
              <span
                class="badge"
                :class="{
                  'bg-success': donation.status === 'completed',
                  'bg-warning': donation.status === 'pending',
                  'bg-danger': donation.status === 'failed',
                }"
              >
                {{ donation.status }}
              </span>
            </td>
            <td class="text-center">{{ formatDate(donation.createdAt) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination controls -->
      <nav v-if="totalPages > 1" aria-label="Donation history pagination">
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
        {{ filteredData.length }} donations
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDonationStore } from '@/stores/donationStore'

const donationStore = useDonationStore()

// Search filters for each column
const searchFilters = ref({
  amount: '',
  status: '',
})

// Date range filter
const dateRange = ref({
  start: '',
  end: '',
})

// Sorting state
const sortColumn = ref('createdAt')
const sortDirection = ref('desc')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 10

// Load donations on mount
onMounted(async () => {
  await donationStore.fetchUserDonations()
})

// Filtered data based on search filters
const filteredData = computed(() => {
  let data = [...donationStore.userDonations]

  // Filter by amount
  if (searchFilters.value.amount) {
    data = data.filter((donation) =>
      donation.amount.toString().includes(searchFilters.value.amount),
    )
  }

  // Filter by status
  if (searchFilters.value.status) {
    data = data.filter((donation) =>
      donation.status.toLowerCase().includes(searchFilters.value.status.toLowerCase()),
    )
  }

  // Filter by date range
  if (dateRange.value.start || dateRange.value.end) {
    data = data.filter((donation) => {
      if (!donation.createdAt) return false
      const donationDate = new Date(donation.createdAt)
      donationDate.setHours(0, 0, 0, 0)

      if (dateRange.value.start && dateRange.value.end) {
        const startDate = new Date(dateRange.value.start)
        const endDate = new Date(dateRange.value.end)
        endDate.setHours(23, 59, 59, 999)
        return donationDate >= startDate && donationDate <= endDate
      } else if (dateRange.value.start) {
        const startDate = new Date(dateRange.value.start)
        return donationDate >= startDate
      } else if (dateRange.value.end) {
        const endDate = new Date(dateRange.value.end)
        endDate.setHours(23, 59, 59, 999)
        return donationDate <= endDate
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
    if (sortColumn.value === 'amount') {
      aVal = parseFloat(aVal)
      bVal = parseFloat(bVal)
    } else if (sortColumn.value === 'createdAt') {
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
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
