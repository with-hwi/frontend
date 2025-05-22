import axios from '@/api/axiosInstance'
import { API_BASE_URL } from '@/constants/urls'
import Cookies from 'js-cookie'

export const refreshToken = () => axios.post(`${API_BASE_URL}/api/v1/auth/refresh`)

export const getAccessToken = () => Cookies.get('auth_token')
