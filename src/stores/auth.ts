import axios from '@/api/axiosInstance'
import { API_BASE_URL } from '@/constants/urls'
import Cookies from 'js-cookie'
import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'
import { useUserStore } from './userStore'

// 로그인 후 redirect할 URL은 브라우저 종료 후 재접속할 때는 필요 없으므로
// sessionStorage에 저장
const sessionStoragePersist = {
  key: 'user-auth-session',
  storage: sessionStorage,
  paths: ['redirectAfterLogin'],
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    // 로그인 성공 후 redirect할 URL
    const _redirectAfterLogin = ref<string | null>(null)

    const redirectAfterLogin = readonly(_redirectAfterLogin)

    const setRedirectAfterLogin = (redirectUrl: string | null) => {
      _redirectAfterLogin.value = redirectUrl
    }

    const refreshAuthToken = async () => {
      try {
        // Access Token, Refresh Token은 쿠키에 저장되어 별도로 상태를 관리할 필요 없음
        await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`)
        return true
      } catch (error) {
        // 리프레시 토큰도 만료된 경우 로그아웃
        logout()
        return false
      }
    }

    const logout = () => {
      const userStore = useUserStore()
      userStore.setUserInfo(null)

      Cookies.remove('auth_token')
      Cookies.remove('refresh_token')
    }

    return {
      redirectAfterLogin,
      setRedirectAfterLogin,
      refreshAuthToken,
      logout,
    }
  },
  {
    persist: sessionStoragePersist,
  },
)
