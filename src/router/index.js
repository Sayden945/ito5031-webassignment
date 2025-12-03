import { createRouter, createWebHistory } from 'vue-router'
import AccountView from '../views/AccountView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import ResourcesView from '../views/ResourcesView.vue'
import AdminView from '../views/AdminView.vue'
import { useUserStore } from '../stores/userStore'
import DonateView from '../views/DonateView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/account',
    name: 'account',
    component: AccountView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/resources',
    name: 'resources',
    component: ResourcesView,
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('../views/PrivacyView.vue'),
  },
  {
    path: '/donate',
    name: 'donate',
    component: DonateView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()

  // Check authentication
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return { name: 'login' }
  }

  // Check admin role
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return { name: 'home' }
  }
})

export default router
