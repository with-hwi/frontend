import { API_BASE_URL } from '@/constants/urls'
import axios from './axiosInstance'
import type { UserInfoDto } from '@/types/dto/user'

const getUserInfo = () => {
  return axios.get<UserInfoDto>(`${API_BASE_URL}/api/v1/users/profile`)
}

export default {
  getUserInfo,
}
