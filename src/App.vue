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
    <NavHeader />

    <main class="main-box">
      <router-view></router-view>
    </main>

    <PageFooter />
  </div>
</template>

<style scoped>
.main-box {
  min-height: calc(100vh - 72px);
}
</style>
