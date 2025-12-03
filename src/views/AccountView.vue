<template>
  <div class="container py-5">
    <h1>Account:</h1>
    <button class="btn btn-primary" @click="handleSignOut">Sign Out</button>

    <div>
      <AccountDash />
      <AccountCalendar />
    </div>
  </div>
</template>

<script setup>
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import AccountDash from '@/components/AccountDash.vue'
import AccountCalendar from '@/components/AccountCalendar.vue'

const userStore = useUserStore()
const router = useRouter()
const auth = getAuth()

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
</script>

<style scoped>
.card {
  border: none;
}

.nav-link {
  cursor: pointer;
}
</style>
