import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'

export const useResourcesStore = defineStore('resources', () => {
  const articles = ref([])
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
      const querySnapshot = await getDocs(collection(db, 'articles'))

      articles.value = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
        }))
        .filter((article) => article.published)
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

  return {
    articles,
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
  }
})
