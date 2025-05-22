import axios from '@/api/axiosInstance'
import { API_BASE_URL } from '@/constants/urls'

export const refreshToken = () => axios.post(`${API_BASE_URL}/api/v1/auth/refresh`)
