<script setup lang="ts">
import type { PointItem } from '@/types/plan'
import { ref, computed, watch } from 'vue'
import Calendar from 'primevue/calendar'

interface Props {
  point: PointItem
  showDate?: boolean
  highlighted?: boolean
  editable?: boolean
  showDragHandle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDate: false,
  editable: false,
  showDragHandle: false,
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
    class="bg-white rounded-xl border border-secondary-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
    :class="{
      'border-primary-400 shadow-md bg-primary-50': highlighted,
      'hover:bg-secondary-50': !highlighted,
    }"
    @mouseenter="emit('mouseenter', point)"
    @mouseleave="emit('mouseleave', point)"
  >
    <!-- 카드 헤더 -->
    <div class="relative pt-3 px-3 bg-gradient-to-r from-white to-secondary-50">
      <div class="flex justify-between items-center">
        <div class="flex-1 min-w-0">
          <!-- 여행지 제목 -->
          <div class="flex items-center space-x-2">
            <!-- 드래그 핸들 -->
            <div
              v-if="showDragHandle"
              class="drag-handle p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded cursor-move transition-all duration-200 flex-shrink-0"
              title="드래그하여 순서 변경"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
                />
              </svg>
            </div>

            <h3
              class="text-md font-bold text-primary-800 line-clamp-2 group-hover:text-primary-900 transition-colors flex-1"
            >
              {{ point.attraction.title }}
            </h3>
          </div>

          <!-- 날짜 표시 (showDate가 true인 경우) -->
          <div v-if="showDate !== false" class="flex items-center text-sm text-secondary-600 mb-2">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clip-rule="evenodd"
              />
            </svg>
            {{ formatDate(point.startDate) }}
          </div>
        </div>

        <!-- 삭제 버튼 -->
        <button
          v-if="editable"
          @click.stop="emit('delete-click', point)"
          class="flex-shrink-0 w-8 h-8 text-secondary-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all duration-200 flex items-center justify-center group/delete"
          title="경유지 삭제"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 group-hover/delete:scale-110 transition-transform"
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

    <!-- 시간 정보 섹션 -->
    <div class="px-3 pb-3">
      <!-- 시간 편집 모드가 아닐 때 -->
      <div
        v-if="!editingTime"
        @click.stop="toggleTimeEdit"
        class="flex items-center p-2 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors duration-200 cursor-pointer group/time"
        :class="{ 'cursor-default': !editable }"
      >
        <div class="flex items-center space-x-2 flex-1">
          <svg class="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clip-rule="evenodd"
            />
          </svg>

          <div class="flex items-center space-x-1 text-sm font-medium">
            <span v-if="point.startDate" class="text-secondary-700">{{
              formatTime(point.startDate)
            }}</span>
            <span v-else class="text-secondary-400 italic">시작 시간 설정</span>

            <span v-if="point.startDate && point.endDate" class="text-secondary-400">~</span>

            <span
              v-if="point.endDate && !isSameDate(point.startDate, point.endDate)"
              class="text-secondary-500"
            >
              {{ formatDate(point.endDate) + ' ' }}
            </span>
            <span v-if="point.endDate" class="text-secondary-700">{{
              formatTime(point.endDate)
            }}</span>
            <span v-else-if="point.startDate" class="text-secondary-400 italic"
              >종료 시간 설정</span
            >
          </div>
        </div>

        <svg
          v-if="editable"
          class="w-4 h-4 text-secondary-400 group-hover/time:text-secondary-600 transition-colors"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
          />
        </svg>
      </div>

      <!-- 시간 편집 모드일 때 -->
      <div v-else class="space-y-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div class="space-y-3">
          <!-- 시작 시간 입력 -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">시작 시간</label>
            <Calendar
              v-model="tempStartDate"
              showTime
              :showSeconds="false"
              dateFormat="yy-mm-dd"
              placeholder="시작 시간을 선택해주세요"
              class="w-full"
              inputClass="w-full px-3 py-2 !text-sm border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200"
              @update:modelValue="validateDates"
            />
          </div>

          <!-- 종료 시간 입력 -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">종료 시간</label>
            <Calendar
              v-model="tempEndDate"
              showTime
              :showSeconds="false"
              dateFormat="yy-mm-dd"
              placeholder="종료 시간을 선택해주세요"
              class="w-full"
              inputClass="w-full px-3 py-2 !text-sm border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200"
              @update:modelValue="validateDates"
            />
          </div>
        </div>

        <!-- 에러 메시지 -->
        <div
          v-if="dateError"
          class="flex items-center p-2 bg-accent-50 border border-accent-200 rounded-lg"
        >
          <svg
            class="w-4 h-4 text-accent-500 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-sm text-accent-700">{{ dateError }}</p>
        </div>

        <!-- 버튼 영역 -->
        <div class="flex justify-end space-x-2 pt-2">
          <button
            @click.stop="cancelTimeEdit"
            class="px-4 py-2 text-sm font-medium text-secondary-600 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 hover:border-secondary-400 transition-all duration-200"
          >
            취소
          </button>
          <button
            @click.stop="toggleTimeEdit"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            :disabled="!!dateError"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* PrimeVue Calendar 브랜드 색상 커스터마이징 */
:deep(.p-calendar) {
  width: 100%;
}

:deep(.p-calendar .p-inputtext) {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid rgb(209 213 219);
  border-radius: 0.5rem;
  transition: all 0.2s;
}

:deep(.p-calendar .p-inputtext:focus) {
  border-color: rgb(157 157 96);
  box-shadow: 0 0 0 2px rgb(248 248 240);
  outline: none;
}

:deep(.p-calendar-panel) {
  border: 1px solid rgb(230 230 204);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

:deep(.p-datepicker-header) {
  background: linear-gradient(to right, rgb(248 248 240), rgb(240 240 224));
  border-bottom: 1px solid rgb(230 230 204);
}

:deep(.p-datepicker-today > .p-highlight) {
  background-color: rgb(168 168 104);
  color: white;
}

:deep(.p-timepicker) {
  border-top: 1px solid rgb(230 230 204);
}
</style>
