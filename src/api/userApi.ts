import { API_BASE_URL } from '@/constants/urls'
import axios from './axiosInstance'
import type {
  EditUserProfileDto,
  MyJoinDto,
  MyLikeDto,
  MyPlanDto,
  UserInfoDto,
  UserProfileDto,
} from '@/types/dto/user'

const getUserInfo = () => {
  return axios.get<UserInfoDto>(`${API_BASE_URL}/api/v1/users/profile`)
}

const getUserProfile = () => {
  return axios.get<UserProfileDto>(`${API_BASE_URL}/api/v1/users/my-page`)
}

const editUserProfile = (data: EditUserProfileDto) => {
  return axios.put<UserProfileDto>(`${API_BASE_URL}/api/v1/users/my-page`, data)
}

const getMyPlans = () => {
  return axios.get<MyPlanDto[]>(`${API_BASE_URL}/api/v1/users/my-plans`)
}

const getMyJoins = () => {
  return axios.get<MyJoinDto[]>(`${API_BASE_URL}/api/v1/users/my-joins`)
}

const getMyLikes = () => {
  return axios.get<MyLikeDto[]>(`${API_BASE_URL}/api/v1/users/likes`)
}

export default {
  getUserInfo,
  getUserProfile,
  editUserProfile,
  getMyPlans,
  getMyJoins,
  getMyLikes,
}
