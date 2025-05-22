import type { UserInfo } from '@/types/user'
import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 사용자 정보
  const _userInfo = ref<UserInfo | null>(null)

  const userInfo = readonly(_userInfo)

  const setUserInfo = (userInfo: UserInfo | null) => {
    _userInfo.value = userInfo
  }

  return {
    userInfo,
    setUserInfo,
  }
})
