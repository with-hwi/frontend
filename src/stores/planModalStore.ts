import { defineStore } from 'pinia'
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createPlan } from '@/services/planService'

export const usePlanModalStore = defineStore('planModal', () => {
  const router = useRouter()

  // 플랜 생성 모달 상태
  const isCreatePlanModalVisible = ref(false)
  const isLoading = ref(false)
  const isSuccess = ref(false)
  const createdPlanId = ref<number | null>(null)

  // 플랜 생성 폼 데이터
  const formData = reactive({
    title: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  })

  // 모달 열기
  const openCreatePlanModal = () => {
    isCreatePlanModalVisible.value = true
  }

  // 모달 닫기
  const closeCreatePlanModal = () => {
    isCreatePlanModalVisible.value = false
    // 모달 닫을 때 상태 초기화
    isSuccess.value = false
    createdPlanId.value = null
  }

  // 성공 애니메이션 완료 후 페이지 이동
  const navigateToCreatedPlan = () => {
    if (createdPlanId.value) {
      router.push(`/plan/${createdPlanId.value}?newPlan=true`)
      closeCreatePlanModal()
    }
  }

  // 모달이 열릴 때마다 폼 데이터 초기화
  watch(
    () => isCreatePlanModalVisible.value,
    (newValue) => {
      if (newValue) {
        // 오늘 날짜
        const today = new Date()

        // 7일 뒤 날짜
        const weekLater = new Date(today)
        weekLater.setDate(today.getDate() + 7)

        formData.title = ''
        formData.startDate = today
        formData.endDate = weekLater

        // 상태 초기화
        isSuccess.value = false
        createdPlanId.value = null
      }
    },
  )

  // 플랜 생성 처리
  const handlePlanSubmit = async () => {
    // 날짜 유효성 검사
    if (!formData.startDate || !formData.endDate) {
      alert('시작 날짜와 끝 날짜를 모두 선택해주세요.')
      return
    }

    if (formData.endDate < formData.startDate) {
      alert('끝 날짜는 시작 날짜보다 늦어야 합니다.')
      return
    }

    try {
      isLoading.value = true

      // 플랜 생성 API 호출
      const response = await createPlan(formData.title, formData.startDate, formData.endDate)
      const planId = response.data.planId

      // 성공 상태로 설정 (애니메이션 트리거)
      createdPlanId.value = planId
      isSuccess.value = true
    } catch (error) {
      console.error('플랜 생성 중 오류 발생:', error)
      alert('플랜 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 상태
    isCreatePlanModalVisible,
    isLoading,
    isSuccess,
    createdPlanId,
    formData,

    // 액션
    openCreatePlanModal,
    closeCreatePlanModal,
    handlePlanSubmit,
    navigateToCreatedPlan,
  }
})
