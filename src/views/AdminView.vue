<template>
  <div class="container py-5">
    <div class="row mb-4">
      <div class="col">
        <h1 class="mb-2">
          <i class="bi bi-shield-lock me-2"></i>
          {{ userStore.isAdmin ? 'Admin Dashboard' : 'Content Management' }}
        </h1>
        <p class="text-muted">
          {{
            userStore.isAdmin
              ? 'Manage articles, events, and view statistics'
              : 'Create and manage articles and blog posts'
          }}
        </p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div v-if="userStore.isAdmin" class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-people display-4 text-primary mb-2"></i>
            <h3 class="mb-1">{{ userStore.allUsers.length }}</h3>
            <p class="text-muted mb-0">Total Users</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-newspaper display-4 text-success mb-2"></i>
            <h3 class="mb-1">{{ resourcesStore.articles.length }}</h3>
            <p class="text-muted mb-0">Total Articles</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-calendar-event display-4 text-info mb-2"></i>
            <h3 class="mb-1">{{ bookingStore.events.length }}</h3>
            <p class="text-muted mb-0">Total Events</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-bookmark-check display-4 text-warning mb-2"></i>
            <h3 class="mb-1">{{ bookingStore.bookings.length }}</h3>
            <p class="text-muted mb-0">Total Bookings</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Management Tabs -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white">
        <ul class="nav nav-tabs card-header-tabs">
          <li v-if="userStore.isAdmin" class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'users' }"
              @click="activeTab = 'users'"
              role="button"
            >
              <i class="bi bi-people me-1"></i>
              Users
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'articles' }"
              @click="activeTab = 'articles'"
              role="button"
            >
              <i class="bi bi-newspaper me-1"></i>
              Articles
            </a>
          </li>
          <li v-if="userStore.isAdmin" class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'events' }"
              @click="activeTab = 'events'"
              role="button"
            >
              <i class="bi bi-calendar-event me-1"></i>
              Events
            </a>
          </li>
          <li v-if="userStore.isAdmin" class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'bookings' }"
              @click="activeTab = 'bookings'"
              role="button"
            >
              <i class="bi bi-bookmark-check me-1"></i>
              Bookings
            </a>
          </li>
        </ul>
      </div>
      <div class="card-body">
        <!-- User Management -->
        <div v-if="activeTab === 'users' && userStore.isAdmin">
          <h5 class="mb-3">User Overview</h5>

          <!-- User Type Statistics -->
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <div class="card bg-primary bg-opacity-10 border-primary">
                <div class="card-body text-center">
                  <h4 class="text-primary mb-1">{{ adminCount }}</h4>
                  <p class="text-muted mb-0">Administrators</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-success bg-opacity-10 border-success">
                <div class="card-body text-center">
                  <h4 class="text-success mb-1">{{ advocateCount }}</h4>
                  <p class="text-muted mb-0">Advocates</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-info bg-opacity-10 border-info">
                <div class="card-body text-center">
                  <h4 class="text-info mb-1">{{ regularUserCount }}</h4>
                  <p class="text-muted mb-0">Regular Users</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Users List -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in userStore.allUsers" :key="user.id">
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="{
                        'bg-danger': user.role === 'admin',
                        'bg-success': user.role === 'advocate',
                        'bg-secondary': user.role === 'user' || !user.role,
                      }"
                    >
                      {{ user.role || 'user' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="changeUserRole(user)"
                      title="Change Role"
                    >
                      <i class="bi bi-person-gear"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Articles Management -->
        <div v-if="activeTab === 'articles'">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Manage Articles</h5>
            <button class="btn btn-primary btn-sm" @click="showAddArticleForm = true">
              <i class="bi bi-plus-lg me-1"></i>
              Add Article
            </button>
          </div>

          <!-- Add Article Form -->
          <div v-if="showAddArticleForm" class="card bg-light mb-3">
            <div class="card-body">
              <h6 class="mb-3">New Article</h6>
              <form @submit.prevent="handleAddArticle">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Title</label>
                    <input v-model="newArticle.title" type="text" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Type</label>
                    <select v-model="newArticle.type" class="form-select" required>
                      <option value="news">News</option>
                      <option value="blog">Blog</option>
                      <option value="media">Media</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea
                      v-model="newArticle.description"
                      class="form-control"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Author</label>
                    <input v-model="newArticle.author" type="text" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Tags (comma-separated)</label>
                    <input v-model="articleTags" type="text" class="form-control" />
                  </div>
                  <div class="col-12">
                    <div class="form-check">
                      <input
                        v-model="newArticle.published"
                        type="checkbox"
                        class="form-check-input"
                        id="publishCheck"
                      />
                      <label class="form-check-label" for="publishCheck"> Published </label>
                    </div>
                  </div>
                  <div class="col-12">
                    <button type="submit" class="btn btn-success me-2">Save Article</button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      @click="showAddArticleForm = false"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Articles List -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="article in resourcesStore.articles" :key="article.id">
                  <td>{{ article.title }}</td>
                  <td>
                    <span class="badge bg-secondary">{{ article.type }}</span>
                  </td>
                  <td>{{ article.author || 'N/A' }}</td>
                  <td>
                    <span class="badge" :class="article.published ? 'bg-success' : 'bg-warning'">
                      {{ article.published ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="btn btn-sm btn-outline-primary me-1"
                      @click="editArticle(article)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteArticle(article.id)"
                      title="Delete"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Edit Article Modal -->
          <div v-if="editingArticle" class="card bg-light mb-3 mt-3">
            <div class="card-body">
              <h6 class="mb-3">Edit Article</h6>
              <form @submit.prevent="handleUpdateArticle">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Title</label>
                    <input
                      v-model="editingArticle.title"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Type</label>
                    <select v-model="editingArticle.type" class="form-select" required>
                      <option value="news">News</option>
                      <option value="blog">Blog</option>
                      <option value="media">Media</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea
                      v-model="editingArticle.description"
                      class="form-control"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Author</label>
                    <input v-model="editingArticle.author" type="text" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Tags (comma-separated)</label>
                    <input v-model="editArticleTags" type="text" class="form-control" />
                  </div>
                  <div class="col-12">
                    <div class="form-check">
                      <input
                        v-model="editingArticle.published"
                        type="checkbox"
                        class="form-check-input"
                        id="editPublishCheck"
                      />
                      <label class="form-check-label" for="editPublishCheck"> Published </label>
                    </div>
                  </div>
                  <div class="col-12">
                    <button type="submit" class="btn btn-success me-2">Update Article</button>
                    <button type="button" class="btn btn-secondary" @click="editingArticle = null">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Events Management -->
        <div v-if="activeTab === 'events' && userStore.isAdmin">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Manage Events</h5>
            <button class="btn btn-primary btn-sm" @click="showAddEventForm = true">
              <i class="bi bi-plus-lg me-1"></i>
              Add Event
            </button>
          </div>

          <!-- Add Event Form -->
          <div v-if="showAddEventForm" class="card bg-light mb-3">
            <div class="card-body">
              <h6 class="mb-3">New Event</h6>
              <form @submit.prevent="handleAddEvent">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Title</label>
                    <input v-model="newEvent.title" type="text" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Location</label>
                    <input v-model="newEvent.location" type="text" class="form-control" required />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea
                      v-model="newEvent.description"
                      class="form-control"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Event Date</label>
                    <input v-model="newEvent.date" type="date" class="form-control" required />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Start Time</label>
                    <input v-model="newEvent.startTime" type="time" class="form-control" required />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">End Time</label>
                    <input v-model="newEvent.endTime" type="time" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Total Spots</label>
                    <input
                      v-model.number="newEvent.spotsTotal"
                      type="number"
                      min="1"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Category</label>
                    <select v-model="newEvent.category" class="form-select" required>
                      <option value="community">Community</option>
                      <option value="fundraising">Fundraising</option>
                      <option value="support">Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <div class="form-check">
                      <input
                        v-model="newEvent.isActive"
                        type="checkbox"
                        class="form-check-input"
                        id="activeCheck"
                      />
                      <label class="form-check-label" for="activeCheck"> Active </label>
                    </div>
                  </div>
                  <div class="col-12">
                    <button type="submit" class="btn btn-success me-2">Save Event</button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      @click="showAddEventForm = false"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Events List -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Spots</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in bookingStore.events" :key="event.id">
                  <td>{{ event.title }}</td>
                  <td>{{ formatDate(event.start) }}</td>
                  <td>{{ event.location }}</td>
                  <td>{{ event.spotsBooked }} / {{ event.spotsTotal }}</td>
                  <td>
                    <span class="badge" :class="event.isActive ? 'bg-success' : 'bg-secondary'">
                      {{ event.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="btn btn-sm btn-outline-primary me-1"
                      @click="editEvent(event)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteEvent(event.id)"
                      title="Delete"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Edit Event Modal -->
          <div v-if="editingEvent" class="card bg-light mb-3 mt-3">
            <div class="card-body">
              <h6 class="mb-3">Edit Event</h6>
              <form @submit.prevent="handleUpdateEvent">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Title</label>
                    <input v-model="editingEvent.title" type="text" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Location</label>
                    <input
                      v-model="editingEvent.location"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea
                      v-model="editingEvent.description"
                      class="form-control"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Event Date</label>
                    <input v-model="editEventDate" type="date" class="form-control" required />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Start Time</label>
                    <input v-model="editEventStartTime" type="time" class="form-control" required />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">End Time</label>
                    <input v-model="editEventEndTime" type="time" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Total Spots</label>
                    <input
                      v-model.number="editingEvent.spotsTotal"
                      type="number"
                      min="1"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Category</label>
                    <select v-model="editingEvent.category" class="form-select" required>
                      <option value="community">Community</option>
                      <option value="fundraising">Fundraising</option>
                      <option value="support">Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <div class="form-check">
                      <input
                        v-model="editingEvent.isActive"
                        type="checkbox"
                        class="form-check-input"
                        id="editActiveCheck"
                      />
                      <label class="form-check-label" for="editActiveCheck"> Active </label>
                    </div>
                  </div>
                  <div class="col-12">
                    <button type="submit" class="btn btn-success me-2">Update Event</button>
                    <button type="button" class="btn btn-secondary" @click="editingEvent = null">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Bookings Management -->
        <div v-if="activeTab === 'bookings' && userStore.isAdmin">
          <h5 class="mb-3">All Bookings</h5>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in bookingStore.bookings" :key="booking.id">
                  <td>{{ booking.userDisplayName || booking.userEmail }}</td>
                  <td>{{ booking.eventTitle }}</td>
                  <td>{{ formatDate(booking.eventDate) }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="booking.status === 'confirmed' ? 'bg-success' : 'bg-secondary'"
                    >
                      {{ booking.status }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteBooking(booking.id)"
                      title="Delete"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useResourcesStore } from '@/stores/resourcesStore'
import { useBookingStore } from '@/stores/bookingStore'
import { useDonationStore } from '@/stores/donationStore'

const userStore = useUserStore()
const resourcesStore = useResourcesStore()
const bookingStore = useBookingStore()
const donationStore = useDonationStore()

// Set default tab based on role
const activeTab = ref(userStore.isAdmin ? 'users' : 'articles')
const showAddArticleForm = ref(false)
const showAddEventForm = ref(false)
const articleTags = ref('')
const editingArticle = ref(null)
const editArticleTags = ref('')
const editingEvent = ref(null)
const editEventDate = ref('')
const editEventStartTime = ref('')
const editEventEndTime = ref('')

const newArticle = ref({
  title: '',
  description: '',
  type: 'news',
  author: '',
  published: true,
  tags: [],
})

const newEvent = ref({
  title: '',
  description: '',
  location: '',
  date: '',
  startTime: '',
  endTime: '',
  spotsTotal: 10,
  category: 'community',
  isActive: true,
})

// User role statistics
const adminCount = computed(() => userStore.allUsers.filter((u) => u.role === 'admin').length)
const advocateCount = computed(() => userStore.allUsers.filter((u) => u.role === 'advocate').length)
const regularUserCount = computed(
  () => userStore.allUsers.filter((u) => !u.role || u.role === 'user').length,
)

const changeUserRole = async (user) => {
  const roles = ['user', 'advocate', 'admin']
  const currentRole = user.role || 'user'
  const currentIndex = roles.indexOf(currentRole)
  const nextRole = roles[(currentIndex + 1) % roles.length]

  if (
    !confirm(`Change ${user.firstName} ${user.lastName}'s role from ${currentRole} to ${nextRole}?`)
  )
    return

  try {
    await userStore.updateUserProfile({ role: nextRole })
    // Refresh all users to show updated role
    await userStore.fetchAllUsers()
    alert(`Role updated to ${nextRole} successfully!`)
  } catch (error) {
    alert('Failed to update user role: ' + error.message)
  }
}

const handleAddArticle = async () => {
  try {
    const articleData = {
      ...newArticle.value,
      tags: articleTags.value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }
    await resourcesStore.addArticle(articleData)

    // Reset form
    newArticle.value = {
      title: '',
      description: '',
      type: 'news',
      author: '',
      published: true,
      tags: [],
    }
    articleTags.value = ''
    showAddArticleForm.value = false

    alert('Article added successfully!')
  } catch (error) {
    alert('Failed to add article: ' + error.message)
  }
}

const editArticle = (article) => {
  editingArticle.value = { ...article }
  editArticleTags.value = article.tags ? article.tags.join(', ') : ''
  showAddArticleForm.value = false
}

const handleUpdateArticle = async () => {
  try {
    const updates = {
      title: editingArticle.value.title,
      description: editingArticle.value.description,
      type: editingArticle.value.type,
      author: editingArticle.value.author,
      published: editingArticle.value.published,
      tags: editArticleTags.value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }
    await resourcesStore.updateArticle(editingArticle.value.id, updates)

    editingArticle.value = null
    editArticleTags.value = ''

    alert('Article updated successfully!')
  } catch (error) {
    alert('Failed to update article: ' + error.message)
  }
}

const deleteArticle = async (articleId) => {
  if (!confirm('Are you sure you want to delete this article?')) return

  try {
    await resourcesStore.deleteArticle(articleId)
    alert('Article deleted successfully!')
  } catch (error) {
    alert('Failed to delete article: ' + error.message)
  }
}

const handleAddEvent = async () => {
  try {
    // Validate that all required fields are filled
    if (!newEvent.value.date || !newEvent.value.startTime || !newEvent.value.endTime) {
      alert('Please fill in all date and time fields.')
      return
    }

    // Combine date and time into Date objects
    const startDate = new Date(`${newEvent.value.date}T${newEvent.value.startTime}`)
    const endDate = new Date(`${newEvent.value.date}T${newEvent.value.endTime}`)

    // Check if end time is after start time
    if (endDate <= startDate) {
      alert('End time must be after start time.')
      return
    }

    const eventData = {
      title: newEvent.value.title,
      description: newEvent.value.description,
      location: newEvent.value.location,
      start: startDate,
      end: endDate,
      spotsTotal: newEvent.value.spotsTotal,
      category: newEvent.value.category,
      isActive: newEvent.value.isActive,
    }
    await bookingStore.createEvent(eventData)

    // Reset form
    newEvent.value = {
      title: '',
      description: '',
      location: '',
      date: '',
      startTime: '',
      endTime: '',
      spotsTotal: 10,
      category: 'community',
      isActive: true,
    }
    showAddEventForm.value = false

    alert('Event created successfully!')
  } catch (error) {
    alert('Failed to create event: ' + error.message)
  }
}

const editEvent = (event) => {
  editingEvent.value = { ...event }
  // Split start and end dates into date and time components
  const start = new Date(event.start)
  const end = new Date(event.end)

  // Extract date (YYYY-MM-DD)
  editEventDate.value = start.toISOString().split('T')[0]

  // Extract start time (HH:MM)
  editEventStartTime.value = start.toTimeString().slice(0, 5)

  // Extract end time (HH:MM)
  editEventEndTime.value = end.toTimeString().slice(0, 5)

  showAddEventForm.value = false
}

const handleUpdateEvent = async () => {
  try {
    // Validate that all required fields are filled
    if (!editEventDate.value || !editEventStartTime.value || !editEventEndTime.value) {
      alert('Please fill in all date and time fields.')
      return
    }

    // Combine date and time into Date objects
    const startDate = new Date(`${editEventDate.value}T${editEventStartTime.value}`)
    const endDate = new Date(`${editEventDate.value}T${editEventEndTime.value}`)

    // Check if end time is after start time
    if (endDate <= startDate) {
      alert('End time must be after start time.')
      return
    }

    const updates = {
      title: editingEvent.value.title,
      description: editingEvent.value.description,
      location: editingEvent.value.location,
      start: startDate,
      end: endDate,
      spotsTotal: editingEvent.value.spotsTotal,
      category: editingEvent.value.category,
      isActive: editingEvent.value.isActive,
    }

    // Update spotsAvailable if spotsTotal changed
    const currentEvent = bookingStore.events.find((e) => e.id === editingEvent.value.id)
    if (currentEvent && updates.spotsTotal !== currentEvent.spotsTotal) {
      const spotsDiff = updates.spotsTotal - currentEvent.spotsTotal
      updates.spotsAvailable = currentEvent.spotsAvailable + spotsDiff
    }

    await bookingStore.updateEvent(editingEvent.value.id, updates)

    editingEvent.value = null
    editEventDate.value = ''
    editEventStartTime.value = ''
    editEventEndTime.value = ''

    alert('Event updated successfully!')
  } catch (error) {
    alert('Failed to update event: ' + error.message)
  }
}

const deleteEvent = async (eventId) => {
  if (
    !confirm(
      'Are you sure you want to delete this event? This will fail if there are active bookings.',
    )
  )
    return

  try {
    await bookingStore.deleteEvent(eventId)
    alert('Event deleted successfully!')
  } catch (error) {
    alert('Failed to delete event: ' + error.message)
  }
}

const deleteBooking = async (bookingId) => {
  if (
    !confirm('Are you sure you want to delete this booking? This will free up a spot in the event.')
  )
    return

  try {
    await bookingStore.deleteBooking(bookingId)
    alert('Booking deleted successfully!')
  } catch (error) {
    alert('Failed to delete booking: ' + error.message)
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  await Promise.all([
    userStore.fetchAllUsers(),
    resourcesStore.fetchAllArticles(),
    bookingStore.fetchEvents(),
    bookingStore.fetchBookings(),
    donationStore.fetchUserDonations(),
  ])
})
</script>

<style scoped>
.nav-link {
  cursor: pointer;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
