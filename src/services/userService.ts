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

const retrieveUserInfoIfHasAccessToken = async () => {
  const accessToken = getAccessToken()
  if (!accessToken) {
    return null
  }

  const userInfo = await getUserInfo()
  const userStore = useUserStore()
  userStore.setUserInfo(userInfo)
}

export { getUserInfo, retrieveUserInfoIfHasAccessToken }
