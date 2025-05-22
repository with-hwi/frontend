import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchPlanView from '@/views/search-plan/SearchPlanView.vue'
import { useAuthStore } from '@/stores/auth'
import type { UserState } from '@/types/auth'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: SearchPlanView,
    },
    {
      path: '/plan',
      name: 'plan',
      component: SearchPlanView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    // 로그인 후 이 페이지로 리다이렉트되므로,
    // 넘겨받은 사용자 정보를 저장하고 기존 페이지로 리다이렉트 처리
    const authStore = useAuthStore()
    const userState = {
      username: to.query.username,
    } as UserState

    console.log('userState', userState)

    authStore.setUserState(userState)

    const redirectPath = authStore.redirectAfterLogin
    if (redirectPath) {
      authStore.setRedirectAfterLogin(null)
      return next(redirectPath)
    }
  }

  next()
})

export default router
