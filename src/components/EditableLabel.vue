<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  label?: string
  placeholder?: string
  mode?: 'input' | 'textarea'
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
  <div class="editable-label-container flex flex-row">
    <div class="editable-label-input-container flex flex-grow-1 relative">
      <input
        v-if="mode === 'input'"
        class="min-w-8 flex-grow-1 overflow-hidden text-ellipsis transition-all hover:bg-gray-200 rounded-sm"
        type="text"
        ref="inputRef"
        @click="handleEditClick"
        @keyup="handleInputKeyup"
        @blur="cancelEdit"
        :placeholder="placeholder"
        v-model="editableLabel"
        :readonly="!isEditing"
      />
      <textarea
        v-else
        class="min-w-8 flex-grow-1 overflow-hidden text-ellipsis transition-all hover:bg-gray-200 rounded-sm"
        ref="inputRef"
        @click="handleEditClick"
        @keyup="handleTextareaKeyup"
        :placeholder="placeholder"
        v-model="editableLabel"
        :readonly="!isEditing"
      />

      <div class="flex flex-row shrink-0 absolute bottom-0 left-0 translate-y-full z-999">
        <div v-show="isEditing" @click="cancelEdit">❎</div>
        <div v-show="isEditing" @click="saveEdit">✅</div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
