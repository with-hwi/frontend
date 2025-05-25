import { defineStore } from 'pinia'
import { ref } from 'vue'
import { redirectToSocialLogin } from '@/services/authService'

export const useLoginModalStore = defineStore('loginModal', () => {
  // 로그인 모달 상태
  const isLoginModalVisible = ref(false)

  // 모달 열기
  const openLoginModal = () => {
    isLoginModalVisible.value = true
  }

  // 모달 닫기
  const closeLoginModal = () => {
    isLoginModalVisible.value = false
  }

  // 소셜 로그인 처리
  const handleSocialLogin = (provider: 'google' | 'kakao' | 'naver') => {
    redirectToSocialLogin(provider)
    // closeLoginModal()
  }

  return {
    // 상태
    isLoginModalVisible,

    // 액션
    openLoginModal,
    closeLoginModal,
    handleSocialLogin,
  }
})
