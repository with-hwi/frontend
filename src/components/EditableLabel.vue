<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  label?: string
  placeholder?: string
  mode?: 'input' | 'textarea'
  disabled?: boolean
}>()

const emit = defineEmits<{
  save: [label: string]
}>()

const inputRef = ref<HTMLInputElement>()
const editableLabel = ref(props.label || '')
const isEditing = ref(false)

watch(
  () => props.label,
  (newLabel?: string) => (editableLabel.value = newLabel || ''),
)

const handleEditClick = () => {
  if (props.disabled) {
    return
  }

  if (!isEditing.value) {
    isEditing.value = true
    setTimeout(() => {
      inputRef.value?.focus()
    })
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editableLabel.value = props.label || ''
  inputRef.value?.blur()
}

const saveEdit = () => {
  isEditing.value = false
  emit('save', editableLabel.value)
  inputRef.value?.blur()
}

const handleInputKeyup = (e: KeyboardEvent) => {
  if (isEditing.value) {
    if (e.key === 'Escape') {
      cancelEdit()
    } else if (e.key === 'Enter') {
      saveEdit()
    }
  }
}

const handleTextareaKeyup = (e: KeyboardEvent) => {
  if (isEditing.value) {
    if (e.key === 'Escape') {
      cancelEdit()
    }
  }
}
</script>

<template>
  <div class="editable-label-container group">
    <div class="editable-label-input-container relative">
      <input
        v-if="mode === 'input'"
        class="w-full px-3 py-2 text-primary-800 bg-transparent border-2 rounded-lg transition-all duration-200 focus:outline-none"
        :class="{
          'border-transparent hover:bg-secondary-50 hover:border-secondary-200 cursor-pointer':
            !isEditing && !props.disabled,
          'border-primary-300 bg-primary-50 focus:border-primary-500 focus:bg-white cursor-text':
            isEditing,
          'opacity-60 cursor-not-allowed': props.disabled,
          'border-secondary-200 bg-secondary-50': !isEditing && props.disabled,
        }"
        type="text"
        ref="inputRef"
        @click="handleEditClick"
        @keyup="handleInputKeyup"
        @blur="cancelEdit"
        :placeholder="placeholder || '클릭하여 편집'"
        v-model="editableLabel"
        :disabled="disabled"
        :readonly="!isEditing"
      />
      <textarea
        v-else
        class="w-full px-3 py-2 text-primary-800 bg-transparent border-2 rounded-lg transition-all duration-200 focus:outline-none resize-y min-h-[6rem]"
        :class="{
          'border-transparent hover:bg-secondary-50 hover:border-secondary-200 cursor-pointer':
            !isEditing && !props.disabled,
          'border-primary-300 bg-primary-50 focus:border-primary-500 focus:bg-white cursor-text':
            isEditing,
          'opacity-60 cursor-not-allowed': props.disabled,
          'border-secondary-200 bg-secondary-50': !isEditing && props.disabled,
        }"
        ref="inputRef"
        @click="handleEditClick"
        @keyup="handleTextareaKeyup"
        @blur="cancelEdit"
        :placeholder="placeholder || '클릭하여 편집'"
        v-model="editableLabel"
        :disabled="disabled"
        :readonly="!isEditing"
      />

      <!-- 편집 컨트롤 버튼들 -->
      <div
        v-show="isEditing"
        class="absolute -bottom-1 right-0 translate-y-full flex gap-1 bg-white border border-secondary-200 rounded-lg shadow-lg p-1 z-10"
      >
        <button
          @click="cancelEdit"
          @mousedown.prevent
          class="flex items-center justify-center w-8 h-8 text-secondary-600 hover:text-accent-600 hover:bg-accent-50 rounded-md transition-all duration-150"
          type="button"
          title="취소 (Esc)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button
          @click="saveEdit"
          @mousedown.prevent
          class="flex items-center justify-center w-8 h-8 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all duration-150"
          type="button"
          title="저장 (Enter)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>

      <!-- 편집 가능 힌트 아이콘 -->
      <div
        v-if="!isEditing && !props.disabled"
        class="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        :class="{
          'top-1/2 -translate-y-1/2': mode === 'input',
          'top-2': mode === 'textarea',
        }"
      >
        <svg
          class="w-4 h-4 text-secondary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* textarea resize handle 커스터마이징 */
textarea::-webkit-resizer {
  background: linear-gradient(
    -45deg,
    transparent 0px,
    transparent 4px,
    var(--color-primary-300) 4px,
    var(--color-primary-300) 6px,
    transparent 6px,
    transparent 10px,
    var(--color-primary-300) 10px,
    var(--color-primary-300) 12px,
    transparent 12px
  );
  border-radius: 0 0 4px 0;
  cursor: nw-resize;
}

/* 편집 모드일 때 resize handle 색상 변경 */
textarea:focus::-webkit-resizer {
  background: linear-gradient(
    -45deg,
    transparent 0px,
    transparent 4px,
    var(--color-primary-500) 4px,
    var(--color-primary-500) 6px,
    transparent 6px,
    transparent 10px,
    var(--color-primary-500) 10px,
    var(--color-primary-500) 12px,
    transparent 12px
  );
}

/* hover 상태에서 resize handle 강조 */
textarea:hover::-webkit-resizer {
  background: linear-gradient(
    -45deg,
    transparent 0px,
    transparent 4px,
    var(--color-primary-400) 4px,
    var(--color-primary-400) 6px,
    transparent 6px,
    transparent 10px,
    var(--color-primary-400) 10px,
    var(--color-primary-400) 12px,
    transparent 12px
  );
}

/* disabled 상태에서 resize handle 숨김 */
textarea:disabled::-webkit-resizer {
  display: none;
}
</style>
