<script setup>
import { onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useUserStore } from '@/stores/userStore'
import NavHeader from './components/NavHeader.vue'
import PageFooter from './components/PageFooter.vue'

const userStore = useUserStore()
const auth = getAuth()

// Listen for auth state changes
onMounted(() => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // User is signed in
      await userStore.login(firebaseUser)
    } else {
      // User is signed out
      userStore.logout()
    }
  })
})
</script>

<template>
  <div class="main-container">
    <!-- Skip to main content link for keyboard users -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <NavHeader />

    <main id="main-content" class="main-box" role="main">
      <router-view></router-view>
    </main>

    <PageFooter />
  </div>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #0d6efd;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid #ffc107;
  outline-offset: 2px;
}

.main-box {
  min-height: calc(100vh - 72px);
}

/* Ensure focus is visible on all interactive elements */
*:focus-visible {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}
</style>
