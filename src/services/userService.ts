import userApi from '@/api/userApi'
import type { MyJoin, MyLike, MyPlan, UserInfo, UserProfile } from '@/types/user'
import { getAccessToken } from './authService'
import { useUserStore } from '@/stores/userStore'
import type { EditUserProfileDto } from '@/types/dto/user'
import { deserializeDate } from '@/utils/date'

const getUserInfo = async () => {
  const response = await userApi.getUserInfo()
  return {
    userId: response.data.userId,
    nickname: response.data.nickname,
  } as UserInfo
}

// 액세스 토큰이 있는데 사용자 정보가 없으면 사용자 정보를 가져옴
const retrieveUserInfoIfPossible = async () => {
  const accessToken = getAccessToken()
  if (!accessToken) {
    return null
  }

  const userStore = useUserStore()
  if (userStore.userInfo) {
    return
  }

  const userInfo = await getUserInfo()
  userStore.setUserInfo(userInfo)
}

const getUserProfile: () => Promise<UserProfile> = async () => {
  const response = await userApi.getUserProfile()
  return {
    nickname: response.data.nickname,
    age: response.data.age,
    sex: response.data.sex,
  }
}

const editUserProfile = async (data: EditUserProfileDto) => {
  const response = await userApi.editUserProfile(data)
  return {
    nickname: response.data.nickname,
    age: response.data.age,
    sex: response.data.sex,
  }
}

const getMyPlans: () => Promise<MyPlan[]> = async () => {
  const response = await userApi.getMyPlans()
  return response.data.map<MyPlan>((plan) => ({
    planId: plan.planId,
    themeId: plan.themeId,
    ownerId: plan.ownerId,
    title: plan.title,
    description: plan.description,
    memo: plan.memo,
    people: plan.people,
    createdAt: deserializeDate(plan.createdAt),
    visibility: plan.visibility,
    startDate: deserializeDate(plan.startDate),
    endDate: deserializeDate(plan.endDate),
  }))
}

const getMyJoins: () => Promise<MyJoin[]> = async () => {
  const response = await userApi.getMyJoins()
  return response.data.map<MyJoin>((plan) => ({
    planId: plan.planId,
    themeId: plan.themeId,
    ownerId: plan.ownerId,
    title: plan.title,
    description: plan.description,
    memo: plan.memo,
    people: plan.people,
    createdAt: deserializeDate(plan.createdAt),
    visibility: plan.visibility,
    startDate: deserializeDate(plan.startDate),
    endDate: deserializeDate(plan.endDate),
  }))
}

const getMyLikes: () => Promise<MyLike[]> = async () => {
  const response = await userApi.getMyLikes()
  return response.data.map<MyJoin>((plan) => ({
    planId: plan.planId,
    themeId: plan.themeId,
    ownerId: plan.ownerId,
    title: plan.title,
    description: plan.description,
    memo: plan.memo,
    people: plan.people,
    createdAt: deserializeDate(plan.createdAt),
    visibility: plan.visibility,
    startDate: deserializeDate(plan.startDate),
    endDate: deserializeDate(plan.endDate),
  }))
}

export {
  getUserInfo,
  retrieveUserInfoIfPossible,
  getUserProfile,
  editUserProfile,
  getMyPlans,
  getMyJoins,
  getMyLikes,
}
