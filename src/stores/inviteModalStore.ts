import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getInviteInfo, acceptInvite } from '@/services/planService'
import type { InviteInfoItem } from '@/types/plan'

export const useInviteModalStore = defineStore('inviteModal', () => {
  // 상태
  const isVisible = ref(false)
  const isLoading = ref(false)
  const isSuccess = ref(false)
  const inviteCode = ref<string | null>(null)
  const inviteInfo = ref<InviteInfoItem | null>(null)
  const error = ref<string | null>(null)

  // computed
  const hasInviteInfo = computed(() => inviteInfo.value !== null)

  // 쿼리 파라미터에서 초대 코드 확인하고 모달 열기
  const checkInviteCode = async (route: any, router: any) => {
    const code = route.query.inviteCode as string
    if (code) {
      inviteCode.value = code
      // 쿼리 파라미터에서 inviteCode 제거
      const query = { ...route.query }
      delete query.inviteCode
      await router.replace({ query })

      // 모달 열기
      openModal()
      // 초대 정보 가져오기
      await fetchInviteInfo(code)
    }
  }

  // 모달 열기
  const openModal = () => {
    isVisible.value = true
    isSuccess.value = false
    error.value = null
  }

  // 모달 닫기
  const closeModal = () => {
    isVisible.value = false
    inviteCode.value = null
    inviteInfo.value = null
    isLoading.value = false
    isSuccess.value = false
    error.value = null
  }

  // 초대 정보 가져오기
  const fetchInviteInfo = async (code: string) => {
    if (!code) return

    isLoading.value = true
    error.value = null

    try {
      inviteInfo.value = await getInviteInfo(code)
    } catch (err) {
      console.error('초대 정보를 가져오는데 실패했습니다:', err)
      error.value = '초대 정보를 가져오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // 초대 수락
  const acceptInvitation = async () => {
    if (!inviteCode.value) return

    isLoading.value = true
    error.value = null

    try {
      await acceptInvite(inviteCode.value)
      isSuccess.value = true
    } catch (err) {
      console.error('초대 수락에 실패했습니다:', err)
      error.value = '초대 수락에 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // 초대 거절
  const rejectInvitation = () => {
    closeModal()
  }

  // 성공 애니메이션 완료 후 모달 닫기
  const onSuccessAnimationComplete = () => {
    setTimeout(() => {
      closeModal()
    }, 1000)
  }

  return {
    // 상태
    isVisible,
    isLoading,
    isSuccess,
    inviteCode,
    inviteInfo,
    error,
    hasInviteInfo,

    // 액션
    checkInviteCode,
    openModal,
    closeModal,
    fetchInviteInfo,
    acceptInvitation,
    rejectInvitation,
    onSuccessAnimationComplete,
  }
})
