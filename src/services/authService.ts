import axios from '@/api/axiosInstance'
import { API_BASE_URL } from '@/constants/urls'
import Cookies from 'js-cookie'

export const redirectToSocialLogin = (provider: 'kakao' | 'naver' | 'google') => {
  if (provider !== 'kakao') {
    alert('카카오 로그인만 됩니다. 안타깝네요.')
    return
  }

  window.location.href = `${API_BASE_URL}/api/v1/auth/${provider}/login`
}

export const refreshToken = () => axios.post(`${API_BASE_URL}/api/v1/auth/refresh`)

export const getAccessToken = () => Cookies.get('auth_token')
