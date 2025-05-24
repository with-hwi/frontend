import userApi from '@/api/userApi'
import type { UserInfo } from '@/types/user'
import { getAccessToken } from './authService'
import { useUserStore } from '@/stores/userStore'

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

export { getUserInfo, retrieveUserInfoIfPossible }
