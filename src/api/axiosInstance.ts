import router from '@/router'
import { refreshToken } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'
import type { AxiosRequestConfig } from 'axios'
import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie'

const instance = axios.create({
  timeout: 3000,
})

instance.defaults.headers.post['Content-Type'] = 'application/json'
instance.defaults.headers.put['Content-Type'] = 'application/json'
instance.defaults.headers.patch['Content-Type'] = 'application/json'

// 응답을 인터셉트하여 액세스 토큰이 필요할 경우 토큰이 있는지 확인하고 없을 경우 갱신 시도
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        if (!Cookies.get('auth_token')) {
          // 애초에 액세스 토큰이 없을 경우
          throw new Error('No access token')
        } else {
          // 액세스 토큰이 만료되어 리프레시를 시도해야할 경우
          originalRequest._retry = true

          const refreshResponse = await refreshToken()

          // 토큰 갱신 실패
          if (refreshResponse.status !== 200) {
            throw new Error('Refresh failed')
          }

          return instance(originalRequest)
        }
      } catch (e) {
        console.log(e)

        // 기존 페이지를 저장해놨다가 로그인이 끝나면 redirect
        // redirect 자체는 로그인 후에 redirect되는 페이지에서 핸들링 (현재는 메인 페이지)
        const authStore = useAuthStore()
        const currentRoute = router.currentRoute.value
        authStore.setRedirectAfterLogin(currentRoute.fullPath)

        console.log('set to ', currentRoute.fullPath)

        router.push('/login')

        return Promise.reject(e)
      }
    }

    return Promise.reject(error)
  },
)

export default instance
