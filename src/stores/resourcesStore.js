import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from './userStore'

export const useResourcesStore = defineStore('resources', () => {
  const articles = ref([])
  const ratings = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed getters for filtered content
  const newsArticles = computed(() =>
    articles.value.filter((article) => article.type === 'news' && article.published),
  )

  const blogPosts = computed(() =>
    articles.value.filter((article) => article.type === 'blog' && article.published),
  )

  const mediaItems = computed(() =>
    articles.value.filter((article) => article.type === 'media' && article.published),
  )

  const publishedArticles = computed(() => articles.value.filter((article) => article.published))

  // Actions
  const fetchArticles = async () => {
    loading.value = true
    error.value = null

    try {
      // Query only published articles to match security rules
      const articlesQuery = query(collection(db, 'articles'), where('published', '==', true))
      const querySnapshot = await getDocs(articlesQuery)

      articles.value = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
        }))
        .sort((a, b) => b.createdAt - a.createdAt)
    } catch (err) {
      error.value = `Failed to fetch articles: ${err.message}`
      console.error('Error fetching articles:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchAllArticles = async () => {
    loading.value = true
    error.value = null

    try {
      const querySnapshot = await getDocs(collection(db, 'articles'))

      articles.value = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
        }))
        .sort((a, b) => b.createdAt - a.createdAt)
    } catch (err) {
      error.value = `Failed to fetch articles: ${err.message}`
      console.error('Error fetching all articles:', err)
    } finally {
      loading.value = false
    }
  }

  const addArticle = async (articleData) => {
    try {
      const docRef = await addDoc(collection(db, 'articles'), {
        ...articleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        published: articleData.published || false,
      })

      const newArticle = {
        id: docRef.id,
        ...articleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      articles.value.unshift(newArticle)
      return docRef.id
    } catch (err) {
      error.value = `Failed to add article: ${err.message}`
      throw err
    }
  }

  const updateArticle = async (articleId, updates) => {
    try {
      const articleRef = doc(db, 'articles', articleId)
      await updateDoc(articleRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      const index = articles.value.findIndex((article) => article.id === articleId)
      if (index !== -1) {
        articles.value[index] = {
          ...articles.value[index],
          ...updates,
          updatedAt: new Date(),
        }
      }
    } catch (err) {
      error.value = `Failed to update article: ${err.message}`
      throw err
    }
  }

  const deleteArticle = async (articleId) => {
    try {
      await deleteDoc(doc(db, 'articles', articleId))
      articles.value = articles.value.filter((article) => article.id !== articleId)
    } catch (err) {
      error.value = `Failed to delete article: ${err.message}`
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Rating methods
  const fetchRatings = async (articleId = null) => {
    try {
      let ratingsQuery = collection(db, 'articleRatings')

      if (articleId) {
        ratingsQuery = query(ratingsQuery, where('articleId', '==', articleId))
      }

      const querySnapshot = await getDocs(ratingsQuery)
      ratings.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (err) {
      console.error('Error fetching ratings:', err)
    }
  }

  const getArticleRating = (articleId) => {
    const articleRatings = ratings.value.filter((r) => r.articleId === articleId)
    if (articleRatings.length === 0) return { average: 0, count: 0 }

    const sum = articleRatings.reduce((acc, r) => acc + r.rating, 0)
    return {
      average: (sum / articleRatings.length).toFixed(1),
      count: articleRatings.length,
    }
  }

  const getUserRating = (articleId, userId) => {
    return ratings.value.find((r) => r.articleId === articleId && r.userId === userId)
  }

  const addRating = async (articleId, rating) => {
    const userStore = useUserStore()
    if (!userStore.user) throw new Error('Must be logged in to rate')

    try {
      const userId = userStore.user.uid
      const existingRating = getUserRating(articleId, userId)

      if (existingRating) {
        // Update existing rating
        const ratingRef = doc(db, 'articleRatings', existingRating.id)
        await updateDoc(ratingRef, {
          rating,
          updatedAt: serverTimestamp(),
        })

        const index = ratings.value.findIndex((r) => r.id === existingRating.id)
        if (index !== -1) {
          ratings.value[index] = { ...ratings.value[index], rating, updatedAt: new Date() }
        }
      } else {
        // Create new rating
        const docRef = await addDoc(collection(db, 'articleRatings'), {
          articleId,
          userId,
          rating,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        ratings.value.push({
          id: docRef.id,
          articleId,
          userId,
          rating,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    } catch (err) {
      error.value = `Failed to submit rating: ${err.message}`
      throw err
    }
  }

  return {
    articles,
    ratings,
    loading,
    error,
    newsArticles,
    blogPosts,
    mediaItems,
    publishedArticles,
    fetchArticles,
    fetchAllArticles,
    addArticle,
    updateArticle,
    deleteArticle,
    clearError,
    fetchRatings,
    getArticleRating,
    getUserRating,
    addRating,
  }
})
