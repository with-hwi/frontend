<script setup lang="ts">
import type { PointItem } from '@/types/plan'
import { ref, computed, watch } from 'vue'

interface Props {
  point: PointItem
  showDate?: boolean
  highlighted?: boolean
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDate: false,
  editable: false,
})

const emit = defineEmits<{
  (e: 'delete-click', point: PointItem): void
  (e: 'mouseenter', point: PointItem): void
  (e: 'mouseleave', point: PointItem): void
  (e: 'update-time', point: PointItem, startDate: Date, endDate: Date): void
}>()

const editingTime = ref(false)
const tempStartDate = ref(props.point.startDate)
const tempEndDate = ref(props.point.endDate)
const dateError = ref('')

// input에 표시될 ISO 형식 시간 문자열
const startDateISO = computed(() => {
  if (!tempStartDate.value) return ''
  return formatDateTimeForInput(tempStartDate.value)
})

const endDateISO = computed(() => {
  if (!tempEndDate.value) return ''
  return formatDateTimeForInput(tempEndDate.value)
})

const updateStartDate = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.value) {
    tempStartDate.value = new Date(input.value)
    validateDates()
  }
}

const updateEndDate = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.value) {
    tempEndDate.value = new Date(input.value)
    validateDates()
  }
}

const validateDates = () => {
  if (tempStartDate.value && tempEndDate.value) {
    if (tempEndDate.value < tempStartDate.value) {
      dateError.value = '종료 시간은 시작 시간보다 이후여야 합니다.'
    } else {
      dateError.value = ''
    }
  } else {
    dateError.value = ''
  }
}

const formatTime = (date?: Date) => {
  if (!date) return ''
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

const formatDate = (date?: Date) => {
  if (!date) return ''
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const isSameDate = (date1?: Date, date2?: Date) => {
  if (!date1 || !date2) return false
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

const formatDateTimeForInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const toggleTimeEdit = () => {
  if (!props.editable) {
    return
  }

  if (editingTime.value) {
    if (!dateError.value) {
      emit('update-time', props.point, tempStartDate.value, tempEndDate.value)
      editingTime.value = false
    }
  } else {
    editingTime.value = true
  }
}

const cancelTimeEdit = () => {
  // 임시 값들을 원래 값으로 초기화
  tempStartDate.value = props.point.startDate
  tempEndDate.value = props.point.endDate
  dateError.value = ''
  editingTime.value = false
}
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-md p-4 mb-4 hover:bg-gray-50 transition-shadow duration-300"
    :class="{ 'bg-gray-50!': highlighted }"
    @mouseenter="emit('mouseenter', point)"
    @mouseleave="emit('mouseleave', point)"
  >
    <div class="flex justify-between items-start relative">
      <div class="flex-1">
        <div v-if="showDate !== false" class="text-sm text-gray-500 mb-1">
          {{ formatDate(point.startDate) }}
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ point.attraction.title }}</h3>

        <div class="flex items-center mt-2">
          <div
            v-if="!editingTime"
            @click="toggleTimeEdit"
            class="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
          >
            <span v-if="point.startDate">{{ formatTime(point.startDate) }}</span>
            <span v-else class="text-gray-400">시작 시간 추가</span>
            <span v-if="point.startDate && point.endDate"> - </span>
            <span v-if="point.endDate && !isSameDate(point.startDate, point.endDate)">
              {{ formatDate(point.endDate) + ' ' }}
            </span>
            <span v-if="point.endDate">{{ formatTime(point.endDate) }}</span>
            <span v-else-if="point.startDate" class="text-gray-400">종료 시간 추가</span>
          </div>

          <div v-else class="flex flex-col w-full space-y-2">
            <div class="flex flex-col w-full">
              <div class="w-full mb-2">
                <input
                  type="datetime-local"
                  :value="startDateISO"
                  @input="updateStartDate"
                  class="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="시작 시간"
                />
              </div>
              <div class="w-full mb-2">
                <input
                  type="datetime-local"
                  :value="endDateISO"
                  @input="updateEndDate"
                  class="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="종료 시간"
                />
              </div>
            </div>

            <div class="flex items-center justify-between">
              <p v-if="dateError" class="text-red-500 text-xs">{{ dateError }}</p>
              <div class="flex space-x-2 ml-auto">
                <button
                  @click="cancelTimeEdit"
                  class="text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 rounded px-3 py-1"
                >
                  취소
                </button>
                <button
                  @click="toggleTimeEdit"
                  class="text-sm text-white bg-blue-500 hover:bg-blue-600 rounded px-3 py-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  :disabled="!!dateError"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="editable"
        @click="emit('delete-click', point)"
        class="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
