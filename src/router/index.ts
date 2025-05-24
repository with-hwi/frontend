import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchPlanView from '@/views/search-plan/SearchPlanView.vue'
import { useAuthStore } from '@/stores/auth'
import { retrieveUserInfoIfPossible } from '@/services/userService'
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

router.beforeEach(async (to, from, next) => {
  // 페이지 이동 사이에 액세스 토큰이 갱신되면 사용자 정보 받아오기
  await retrieveUserInfoIfPossible()

  if (to.path === '/') {
    // 로그인 후 이 페이지로 리다이렉트되면 기존 페이지로 리다이렉트 처리
    const authStore = useAuthStore()
    const redirectPath = authStore.redirectAfterLogin

    if (redirectPath) {
      authStore.setRedirectAfterLogin(null)
      return next(redirectPath)
    }
  }

  next()
})

export default router
