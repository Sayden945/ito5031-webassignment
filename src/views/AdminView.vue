<template>
  <div class="container py-5">
    <div class="row mb-4">
      <div class="col">
        <h1 class="mb-2">
          <i class="bi bi-shield-lock me-2"></i>
          Admin Dashboard
        </h1>
        <p class="text-muted">Manage articles, events, and view statistics</p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-newspaper display-4 text-primary mb-2"></i>
            <h3 class="mb-1">{{ resourcesStore.articles.length }}</h3>
            <p class="text-muted mb-0">Total Articles</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-calendar-event display-4 text-success mb-2"></i>
            <h3 class="mb-1">{{ bookingStore.events.length }}</h3>
            <p class="text-muted mb-0">Total Events</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-bookmark-check display-4 text-info mb-2"></i>
            <h3 class="mb-1">{{ bookingStore.bookings.length }}</h3>
            <p class="text-muted mb-0">Total Bookings</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-currency-dollar display-4 text-warning mb-2"></i>
            <h3 class="mb-1">{{ donationStore.donations.length }}</h3>
            <p class="text-muted mb-0">Total Donations</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Management Tabs -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white">
        <ul class="nav nav-tabs card-header-tabs">
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
          <li class="nav-item">
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
          <li class="nav-item">
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
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteArticle(article.id)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Events Management -->
        <div v-if="activeTab === 'events'">
          <h5 class="mb-3">Manage Events</h5>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Spots</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in bookingStore.events" :key="event.id">
                  <td>{{ event.title }}</td>
                  <td>{{ formatDate(event.start) }}</td>
                  <td>{{ event.spotsBooked }} / {{ event.spotsTotal }}</td>
                  <td>
                    <span class="badge" :class="event.isActive ? 'bg-success' : 'bg-secondary'">
                      {{ event.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bookings Management -->
        <div v-if="activeTab === 'bookings'">
          <h5 class="mb-3">All Bookings</h5>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in bookingStore.bookings" :key="booking.id">
                  <td>{{ booking.userDisplayName || booking.userEmail }}</td>
                  <td>{{ booking.eventTitle }}</td>
                  <td>{{ formatDate(booking.eventDate) }}</td>
                  <td>
                    <span class="badge bg-success">{{ booking.status }}</span>
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
import { ref, onMounted } from 'vue'
import { useResourcesStore } from '@/stores/resourcesStore'
import { useBookingStore } from '@/stores/bookingStore'
import { useDonationStore } from '@/stores/donationStore'

const resourcesStore = useResourcesStore()
const bookingStore = useBookingStore()
const donationStore = useDonationStore()

const activeTab = ref('articles')
const showAddArticleForm = ref(false)
const articleTags = ref('')

const newArticle = ref({
  title: '',
  description: '',
  type: 'news',
  author: '',
  published: true,
  tags: [],
})

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

const deleteArticle = async (articleId) => {
  if (!confirm('Are you sure you want to delete this article?')) return

  try {
    await resourcesStore.deleteArticle(articleId)
    alert('Article deleted successfully!')
  } catch (error) {
    alert('Failed to delete article: ' + error.message)
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  await Promise.all([
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
