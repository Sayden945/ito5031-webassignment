<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <i class="bi bi-house-heart-fill me-2"></i>
        Safe Haven
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link" active-class="active">About Us</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/resources" class="nav-link" active-class="active">
              Resources
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/donate" class="nav-link" active-class="active">Donate</router-link>
          </li>
          <li v-if="userStore.isAdmin || userStore.isAdvocate" class="nav-item">
            <router-link to="/admin" class="nav-link" active-class="active">
              <i class="bi bi-shield-lock me-1"></i>
              {{ userStore.isAdmin ? 'Admin' : 'Content' }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/account" class="nav-link" active-class="active">
              <i class="bi bi-person-circle me-1"></i>
              Account
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore'
import { onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// Close navbar on route change (when link is clicked)
const unsubscribe = router.afterEach(() => {
  const navElement = document.getElementById('navbarNav')
  if (navElement && window.bootstrap) {
    const bsCollapse = window.bootstrap.Collapse.getInstance(navElement)
    if (bsCollapse) {
      bsCollapse.hide()
    }
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>
<style scoped>
.navbar-brand {
  font-weight: 600;
  font-size: 1.25rem;
}

.nav-link.active {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
}

.nav-link {
  transition: background-color 0.2s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
}
</style>
