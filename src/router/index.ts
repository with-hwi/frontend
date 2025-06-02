import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchPlanView from '@/views/search-plan/SearchPlanView.vue'
import MyPageView from '../views/MyPageView.vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/userStore'
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
      path: '/search',
      name: 'search',
      component: SearchPlanView,
    },
    {
      path: '/plan/:planId',
      name: 'plan',
      component: SearchPlanView,
    },
    {
      path: '/invite/:inviteCode',
      name: 'invite',
      redirect: (to) => ({
        path: '/',
        query: { inviteCode: to.params.inviteCode },
      }),
    },
    {
      path: '/my-page',
      name: 'my-page',
      component: MyPageView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  // 페이지 이동 사이에 액세스 토큰이 갱신되면 사용자 정보 받아오기
  await retrieveUserInfoIfPossible()

  const authStore = useAuthStore()
  const userStore = useUserStore()

  // 인증이 필요한 페이지 확인
  if (to.meta.requiresAuth && !userStore.userInfo) {
    // 로그인이 필요하다면 현재 경로를 저장하고 홈으로 리다이렉트
    authStore.setRedirectAfterLogin(to.fullPath)
    return next('/')
  }

  if (to.path === '/') {
    // 로그인 후 이 페이지로 리다이렉트되면 기존 페이지로 리다이렉트 처리
    const redirectPath = authStore.redirectAfterLogin

    if (redirectPath) {
      authStore.setRedirectAfterLogin(null)
      return next(redirectPath)
    }
  }

  next()
})

export default router
