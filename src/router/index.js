import { createRouter, createWebHistory } from 'vue-router'
import AccountView from '../views/AccountView.vue'
import store from '../stores/store.js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/Account',
    name: 'Account',
    component: AccountView,
    beforeEnter: (to) => {
      if (!store.state.isAuthenticated && to.name !== 'Login') {
        return { name: 'Login' }
      }
    },
  },
  {
    path: '/Login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/Register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
