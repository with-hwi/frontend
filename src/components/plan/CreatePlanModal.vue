<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
      <h2 class="text-xl font-bold mb-4">여행 계획 생성</h2>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            계획 제목
          </label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="여행 계획 제목을 입력하세요"
          />
        </div>

        <div class="mb-4">
          <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">
            시작 날짜
          </label>
          <input
            id="startDate"
            v-model="formData.startDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="mb-6">
          <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">
            끝 날짜
          </label>
          <input
            id="endDate"
            v-model="formData.endDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            취소
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? '생성 중...' : '생성' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createPlan } from '@/services/planService'

interface Props {
  isVisible: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const isLoading = ref(false)
const formData = reactive({
  title: '',
  startDate: '',
  endDate: '',
})

// 모달이 열릴 때마다 폼 데이터 초기화
watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue) {
      // 오늘 날짜 계산
      const today = new Date()
      const todayString = today.toISOString().split('T')[0]

      // 7일 뒤 날짜 계산
      const weekLater = new Date(today)
      weekLater.setDate(today.getDate() + 7)
      const weekLaterString = weekLater.toISOString().split('T')[0]

      formData.title = ''
      formData.startDate = todayString
      formData.endDate = weekLaterString
    }
  },
)

const handleSubmit = async () => {
  // 날짜 유효성 검사
  const startDate = new Date(formData.startDate)
  const endDate = new Date(formData.endDate)

  if (endDate < startDate) {
    alert('끝 날짜는 시작 날짜보다 늦어야 합니다.')
    return
  }

  try {
    isLoading.value = true

    // 플랜 생성 API 호출
    const response = await createPlan(formData.title, startDate, endDate)
    const planId = response.data.planId

    // 생성된 플랜 페이지로 이동
    await router.push(`/plan/${planId}?newPlan=true`)

    // 모달 닫기
    emit('close')
  } catch (error) {
    console.error('플랜 생성 중 오류 발생:', error)
    alert('플랜 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('close')
}
</script>
