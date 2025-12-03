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
          <div class="card h-100 shadow-sm border-0">
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
              <p class="card-text text-muted flex-grow-1">{{ article.description }}</p>

              <!-- Article metadata -->
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">{{ formatDate(article.createdAt) }}</small>
                  <small v-if="article.author" class="text-muted">by {{ article.author }}</small>
                </div>

                <!-- Tags -->
                <div v-if="article.tags && article.tags.length" class="mt-2">
                  <span
                    v-for="tag in article.tags"
                    :key="tag"
                    class="badge bg-secondary me-1"
                    style="font-size: 0.7rem"
                  >
                    {{ tag }}
                  </span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useResourcesStore } from '@/stores/resourcesStore'

const resourcesStore = useResourcesStore()
const activeFilter = ref('all')

// Computed property for filtered articles
const filteredArticles = computed(() => {
  if (activeFilter.value === 'all') {
    return resourcesStore.publishedArticles
  }
  return resourcesStore.publishedArticles.filter((article) => article.type === activeFilter.value)
})

// Format date for display
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Fetch data on component mount
onMounted(async () => {
  await resourcesStore.fetchArticles()
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
</style>
