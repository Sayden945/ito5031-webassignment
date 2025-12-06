import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/userStore'

export const useDonationStore = defineStore('donation', () => {
  const userStore = useUserStore()
  const donations = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed getters
  const userDonations = computed(() => {
    if (!userStore.user) return []
    return donations.value.filter((donation) => donation.userId === userStore.user.uid)
  })

  const totalDonated = computed(() => {
    return userDonations.value.reduce((sum, donation) => sum + donation.amount, 0)
  })

  const donationCount = computed(() => userDonations.value.length)

  // Fetch user's donations
  const fetchUserDonations = async () => {
    if (!userStore.user) {
      donations.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'donations'),
        where('userId', '==', userStore.user.uid),
        orderBy('createdAt', 'desc'),
      )
      const querySnapshot = await getDocs(q)

      donations.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }))
    } catch (err) {
      error.value = `Failed to fetch donations: ${err.message}`
      console.error('Error fetching donations:', err)
    } finally {
      loading.value = false
    }
  }

  // Add new donation
  const addDonation = async (amount) => {
    if (!userStore.user) {
      throw new Error('User must be logged in to donate')
    }

    if (!amount || amount <= 0) {
      throw new Error('Please enter a valid donation amount')
    }

    loading.value = true
    error.value = null

    try {
      const donationData = {
        userId: userStore.user.uid,
        userEmail: userStore.user.email,
        userFirstName:
          userStore.userProfile?.firstName || userStore.user.displayName?.split(' ')[0] || 'User',
        amount: parseFloat(amount),
        status: 'completed',
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'donations'), donationData)

      // Add to local state
      const newDonation = {
        id: docRef.id,
        ...donationData,
        createdAt: new Date(),
      }
      donations.value.unshift(newDonation)

      return docRef.id
    } catch (err) {
      error.value = `Failed to process donation: ${err.message}`
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    donations,
    loading,
    error,
    userDonations,
    totalDonated,
    donationCount,
    fetchUserDonations,
    addDonation,
    clearError,
  }
})
