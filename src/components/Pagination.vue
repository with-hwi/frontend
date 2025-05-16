<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  pageSize: number
  totalCount: number
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

// 총 페이지 수 계산
const totalPages = computed(() => {
  return Math.ceil(props.totalCount / props.pageSize) || 1
})

// 페이지네이션 표시 범위 계산
const pageRange = computed(() => {
  const range = []
  const maxPages = 5 // 한 번에 표시할 최대 페이지 수
  const startPage = Math.max(1, props.currentPage - Math.floor(maxPages / 2))
  const endPage = Math.min(totalPages.value, startPage + maxPages - 1)

  for (let i = startPage; i <= endPage; i++) {
    range.push(i)
  }

  return range
})

// 페이지 변경 핸들러
const handlePageChange = (page: number) => {
  emit('pageChange', page)
}
</script>

<template>
  <div v-if="totalCount > 0" class="pagination">
    <div class="pagination-info">
      <span
        >{{ totalCount }}개 중 {{ (currentPage - 1) * pageSize + 1 }}-{{
          Math.min(currentPage * pageSize, totalCount)
        }}개 표시</span
      >
    </div>
    <div class="pagination-controls">
      <button
        @click="handlePageChange(1)"
        :disabled="currentPage === 1 || loading"
        class="pagination-button"
      >
        &laquo;
      </button>
      <button
        @click="handlePageChange(currentPage - 1)"
        :disabled="currentPage === 1 || loading"
        class="pagination-button"
      >
        &lt;
      </button>

      <button
        v-for="page in pageRange"
        :key="page"
        @click="handlePageChange(page)"
        :class="['pagination-button', { active: page === currentPage }]"
        :disabled="loading"
      >
        {{ page }}
      </button>

      <button
        @click="handlePageChange(currentPage + 1)"
        :disabled="currentPage === totalPages || loading"
        class="pagination-button"
      >
        &gt;
      </button>
      <button
        @click="handlePageChange(totalPages)"
        :disabled="currentPage === totalPages || loading"
        class="pagination-button"
      >
        &raquo;
      </button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.pagination-controls {
  display: flex;
  gap: 0.25rem;
}

.pagination-button {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.pagination-button.active {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
