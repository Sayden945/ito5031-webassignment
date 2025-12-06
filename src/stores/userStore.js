import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/firebase'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const userProfile = ref(null)
  const allUsers = ref([])
  const isAuthenticated = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // Role-based computed properties
  const isAdmin = computed(() => userProfile.value?.role === 'admin')
  const isAdvocate = computed(() => userProfile.value?.role === 'advocate')
  const userRole = computed(() => userProfile.value?.role || 'user')

  const login = async (firebaseUser) => {
    try {
      loading.value = true
      user.value = firebaseUser
      isAuthenticated.value = true

      // Create or fetch user profile
      await fetchUserProfile(firebaseUser.uid)

      localStorage.setItem('isUserLoggedIn', 'true')
    } catch (err) {
      error.value = `Login error: ${err.message}`
      console.error('User store login error:', err)
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    userProfile.value = null
    isAuthenticated.value = false
    localStorage.removeItem('isUserLoggedIn')
  }

  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        userProfile.value = { id: userDoc.id, ...userDoc.data() }
      } else {
        // Create new user profile
        await createUserProfile(uid)
      }
    } catch (err) {
      error.value = `Failed to fetch user profile: ${err.message}`
      console.error('Error fetching user profile:', err)
    }
  }

  const createUserProfile = async (uid, additionalData = {}) => {
    try {
      const userRef = doc(db, 'users', uid)
      const userData = {
        email: user.value?.email,
        firstName: user.value?.displayName?.split(' ')[0] || '',
        lastName: user.value?.displayName?.split(' ').slice(1).join(' ') || '',
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...additionalData,
      }

      await setDoc(userRef, userData)
      userProfile.value = { id: uid, ...userData, createdAt: new Date(), updatedAt: new Date() }
    } catch (err) {
      error.value = `Failed to create user profile: ${err.message}`
      throw err
    }
  }

  const updateUserProfile = async (updates) => {
    try {
      if (!user.value) throw new Error('No authenticated user')

      const userRef = doc(db, 'users', user.value.uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      userProfile.value = {
        ...userProfile.value,
        ...updates,
        updatedAt: new Date(),
      }
    } catch (err) {
      error.value = `Failed to update profile: ${err.message}`
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const refreshUserProfile = async () => {
    if (!user.value) {
      console.warn('No user to refresh profile for')
      return
    }
    await fetchUserProfile(user.value.uid)
  }

  const fetchAllUsers = async () => {
    try {
      loading.value = true
      const querySnapshot = await getDocs(collection(db, 'users'))
      allUsers.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (err) {
      error.value = `Failed to fetch users: ${err.message}`
      console.error('Error fetching users:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    userProfile,
    allUsers,
    isAuthenticated,
    loading,
    error,
    isAdmin,
    isAdvocate,
    userRole,
    login,
    logout,
    fetchUserProfile,
    createUserProfile,
    updateUserProfile,
    clearError,
    refreshUserProfile,
    fetchAllUsers,
  }
})
