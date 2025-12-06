<template>
  <div class="container py-5">
    <h1 class="mb-4">Resources</h1>

    <!-- Loading State -->
    <div v-if="resourcesStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading resources...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="resourcesStore.error"
      class="alert alert-danger d-flex align-items-center"
      role="alert"
    >
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div>
        {{ resourcesStore.error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="resourcesStore.clearError()">
          Dismiss
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Filter Navigation -->
      <ul class="nav nav-pills mb-4 justify-content-center">
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeFilter === 'all' }"
            @click="activeFilter = 'all'"
            role="button"
          >
            All
            <span class="badge bg-light text-dark ms-1">{{
              resourcesStore.publishedArticles.length
            }}</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeFilter === 'news' }"
            @click="activeFilter = 'news'"
            role="button"
          >
            News
            <span class="badge bg-light text-dark ms-1">{{
              resourcesStore.newsArticles.length
            }}</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeFilter === 'media' }"
            @click="activeFilter = 'media'"
            role="button"
          >
            Media
            <span class="badge bg-light text-dark ms-1">{{
              resourcesStore.mediaItems.length
            }}</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeFilter === 'blog' }"
            @click="activeFilter = 'blog'"
            role="button"
          >
            Blog
            <span class="badge bg-light text-dark ms-1">{{ resourcesStore.blogPosts.length }}</span>
          </a>
        </li>
      </ul>

      <!-- Articles Grid -->
      <div class="row g-4">
        <div v-for="article in filteredArticles" :key="article.id" class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border-0" @click="openModal(article)" role="button">
            <!-- Card Image -->
            <img
              v-if="article.imageUrl"
              :src="article.imageUrl"
              class="card-img-top"
              :alt="article.title"
              style="height: 200px; object-fit: cover"
            />
            <div
              v-else
              class="card-img-top bg-secondary d-flex align-items-center justify-content-center"
              style="height: 200px"
            >
              <i class="bi bi-image text-white" style="font-size: 3rem"></i>
            </div>

            <div class="card-body d-flex flex-column">
              <div class="mb-2">
                <span
                  class="badge mb-2"
                  :class="{
                    'bg-primary': article.type === 'news',
                    'bg-success': article.type === 'blog',
                    'bg-info': article.type === 'media',
                  }"
                >
                  {{ article.type }}
                </span>
              </div>
              <h5 class="card-title">{{ article.title }}</h5>

              <!-- Rating Display (for blog articles only) -->
              <div v-if="article.type === 'blog'" class="mb-3">
                <div class="d-flex align-items-center">
                  <div class="stars me-2">
                    <i
                      v-for="star in 5"
                      :key="star"
                      class="bi"
                      :class="
                        star <= Math.round(resourcesStore.getArticleRating(article.id).average)
                          ? 'bi-star-fill text-warning'
                          : 'bi-star text-muted'
                      "
                    ></i>
                  </div>
                  <small class="text-muted">
                    {{ resourcesStore.getArticleRating(article.id).average }}
                    ({{ resourcesStore.getArticleRating(article.id).count }})
                  </small>
                </div>
              </div>

              <!-- Article metadata -->
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">{{ formatDate(article.createdAt) }}</small>
                  <small v-if="article.author" class="text-muted">by {{ article.author }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredArticles.length === 0" class="text-center py-5">
        <div class="mb-3">
          <i class="bi bi-inbox display-4 text-muted"></i>
        </div>
        <h4 class="text-muted">
          No {{ activeFilter === 'all' ? 'resources' : activeFilter }} found
        </h4>
        <p class="text-muted">Check back later for new content.</p>
      </div>
    </div>

    <!-- Article Modal -->
    <div
      v-if="selectedArticle"
      class="modal fade show d-block"
      tabindex="-1"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <div class="w-100">
              <span
                class="badge mb-2"
                :class="{
                  'bg-primary': selectedArticle.type === 'news',
                  'bg-success': selectedArticle.type === 'blog',
                  'bg-info': selectedArticle.type === 'media',
                }"
              >
                {{ selectedArticle.type }}
              </span>
              <h3 class="modal-title">{{ selectedArticle.title }}</h3>
            </div>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Modal Image -->
            <img
              v-if="selectedArticle.imageUrl"
              :src="selectedArticle.imageUrl"
              class="img-fluid rounded mb-3"
              :alt="selectedArticle.title"
            />

            <!-- Article Content -->
            <p class="lead">{{ selectedArticle.description }}</p>

            <div v-if="selectedArticle.content" class="article-content mb-4">
              <div v-html="selectedArticle.content"></div>
            </div>

            <!-- Rating Section for Blog Articles -->
            <div v-if="selectedArticle.type === 'blog'" class="border-top pt-3 mb-3">
              <h5>Article Rating</h5>
              <div class="d-flex align-items-center mb-3">
                <div class="stars me-2">
                  <i
                    v-for="star in 5"
                    :key="star"
                    class="bi"
                    :class="
                      star <=
                      Math.round(resourcesStore.getArticleRating(selectedArticle.id).average)
                        ? 'bi-star-fill text-warning'
                        : 'bi-star text-muted'
                    "
                    style="font-size: 1.5rem"
                  ></i>
                </div>
                <div>
                  <div class="fw-bold">
                    {{ resourcesStore.getArticleRating(selectedArticle.id).average }} / 5
                  </div>
                  <small class="text-muted">
                    {{ resourcesStore.getArticleRating(selectedArticle.id).count }}
                    {{
                      resourcesStore.getArticleRating(selectedArticle.id).count === 1
                        ? 'rating'
                        : 'ratings'
                    }}
                  </small>
                </div>
              </div>

              <!-- User Rating Input -->
              <div v-if="userStore.isAuthenticated" class="rating-input">
                <small class="text-muted d-block mb-2">Rate this article:</small>
                <div class="stars-interactive">
                  <i
                    v-for="star in 5"
                    :key="star"
                    class="bi bi-star-fill"
                    :class="
                      star <=
                      (hoverRating[selectedArticle.id] || getUserRatingValue(selectedArticle.id))
                        ? 'text-warning'
                        : 'text-muted'
                    "
                    @mouseenter="hoverRating[selectedArticle.id] = star"
                    @mouseleave="hoverRating[selectedArticle.id] = 0"
                    @click="submitRating(selectedArticle.id, star)"
                    role="button"
                    style="font-size: 2rem"
                  ></i>
                </div>
              </div>
              <div v-else>
                <small class="text-muted"
                  ><router-link to="/account">Log in</router-link> to rate this article</small
                >
              </div>
            </div>

            <!-- Metadata -->
            <div class="border-top pt-3">
              <div class="row">
                <div class="col-sm-6">
                  <small class="text-muted d-block">Published:</small>
                  <p>{{ formatDate(selectedArticle.createdAt) }}</p>
                </div>
                <div v-if="selectedArticle.author" class="col-sm-6">
                  <small class="text-muted d-block">Author:</small>
                  <p>{{ selectedArticle.author }}</p>
                </div>
              </div>

              <!-- Tags -->
              <div v-if="selectedArticle.tags && selectedArticle.tags.length">
                <small class="text-muted d-block mb-2">Tags:</small>
                <span
                  v-for="tag in selectedArticle.tags"
                  :key="tag"
                  class="badge bg-secondary me-1"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedArticle" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useResourcesStore } from '@/stores/resourcesStore'
import { useUserStore } from '@/stores/userStore'

const resourcesStore = useResourcesStore()
const userStore = useUserStore()
const activeFilter = ref('all')
const hoverRating = ref({})
const selectedArticle = ref(null)

// Computed property for filtered articles
const filteredArticles = computed(() => {
  if (activeFilter.value === 'all') {
    return resourcesStore.publishedArticles
  }
  return resourcesStore.publishedArticles.filter((article) => article.type === activeFilter.value)
})

// Modal functions
const openModal = (article) => {
  selectedArticle.value = article
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedArticle.value = null
  document.body.style.overflow = ''
}

// Format date for display
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Get user's rating for an article
const getUserRatingValue = (articleId) => {
  if (!userStore.user) return 0
  const userRating = resourcesStore.getUserRating(articleId, userStore.user.uid)
  return userRating ? userRating.rating : 0
}

// Submit rating
const submitRating = async (articleId, rating) => {
  try {
    await resourcesStore.addRating(articleId, rating)
    hoverRating.value[articleId] = 0
  } catch (err) {
    console.error('Failed to submit rating:', err)
  }
}

// Fetch data on component mount
onMounted(async () => {
  await resourcesStore.fetchArticles()
  await resourcesStore.fetchRatings()
})
</script>

<style scoped>
.card {
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.nav-link {
  cursor: pointer;
  border-radius: 25px;
  transition: all 0.2s ease-in-out;
}

.nav-link:hover:not(.active) {
  background-color: rgba(13, 110, 253, 0.1);
}

.badge {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stars i {
  font-size: 0.9rem;
}

.stars-interactive i {
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stars-interactive i:hover {
  transform: scale(1.2);
}

.rating-input {
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 0.25rem;
}

.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card[role='button'] {
  cursor: pointer;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.article-content {
  line-height: 1.8;
}

.article-content p {
  margin-bottom: 1rem;
}
</style>
