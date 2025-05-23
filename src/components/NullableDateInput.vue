<!-- TODO: 현재는 date only 모드만 지원함. 추후 datetime 모드 지원 추가하기! -->
<template>
  <div class="flex flex-grow-1 relative">
    <!-- date가 null일 때 label 표시 -->
    <div
      v-if="!props.modelValue"
      @click="handleLabelClick"
      class="flex-grow-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-pointer transition-all duration-200 select-none hover:bg-gray-100 hover:border-gray-400"
    >
      {{ label }}
    </div>

    <!-- date가 있을 때 input 표시 -->
    <input
      v-else
      type="date"
      :value="formatDateForInput(props.modelValue)"
      :min="props.minDate ? formatDateForInput(props.minDate) : undefined"
      :max="props.maxDate ? formatDateForInput(props.maxDate) : undefined"
      @input="handleDateChange"
      @blur="handleBlur"
      class="flex-grow-1 px-3 py-2 border border-gray-300 rounded-md text-sm transition-colors duration-200 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
      ref="dateInputRef"
      :disabled="props.disabled"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, withDefaults } from 'vue'

interface Props {
  modelValue?: Date
  label: string
  defaultDateGenerator?: () => Date
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: Date | undefined): void
}

const props = withDefaults(defineProps<Props>(), {
  defaultDateGenerator: () => new Date(),
})
const emit = defineEmits<Emits>()

const dateInputRef = ref<HTMLInputElement>()

// 라벨 클릭 시 기본 날짜 생성 및 input으로 전환
const handleLabelClick = async () => {
  if (props.disabled) {
    return
  }

  const defaultDate = props.defaultDateGenerator()
  emit('update:modelValue', defaultDate)

  // DOM 업데이트 후 input에 포커스
  await nextTick()
  dateInputRef.value?.focus()
}

// 날짜 변경 처리
const handleDateChange = (event: Event) => {
  if (props.disabled) {
    return
  }

  const target = event.target as HTMLInputElement
  const dateValue = target.value
  if (dateValue) {
    const newDate = new Date(dateValue)
    emit('update:modelValue', newDate)
  } else {
    emit('update:modelValue', undefined)
  }
}

// input에서 포커스가 벗어날 때 빈 값이면 null로 설정
const handleBlur = (event: Event) => {
  if (props.disabled) {
    return
  }

  const target = event.target as HTMLInputElement
  if (!target.value) {
    emit('update:modelValue', undefined)
  }
}

// Date 객체를 input[type="date"] 형식으로 변환
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0]
}
</script>
