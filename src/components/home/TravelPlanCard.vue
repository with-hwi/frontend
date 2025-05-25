<template>
  <div
    class="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 transform transition-transform duration-300 hover:scale-105"
    :class="rotationClass"
  >
    <!-- 플랜 아이콘 -->
    <div class="flex items-start gap-4 mb-4">
      <div
        class="w-12 h-12 bg-secondary-200 rounded-full flex items-center justify-center flex-shrink-0"
      >
        <span class="text-2xl">🗺️</span>
      </div>

      <!-- 플랜 정보 -->
      <div class="flex-1">
        <h3 class="text-xl font-bold text-primary-900">{{ planTitle }}</h3>
        <p class="text-primary-700 font-medium">
          {{ participants }}명 참여 · {{ duration }}일 계획
        </p>
      </div>

      <!-- 하트 아이콘 -->
      <button class="btn-icon-heart">
        <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </button>
    </div>

    <!-- 여행지 목록 -->
    <div class="space-y-2">
      <div
        v-for="(destination, index) in destinations"
        :key="index"
        class="flex items-center gap-3 relative"
      >
        <div class="relative flex-shrink-0">
          <div class="w-3 h-3 bg-secondary-400 rounded-full z-10 relative"></div>
          <!-- 세로선 (마지막 항목이 아닌 경우에만) -->
          <div
            v-if="index < destinations.length - 1"
            class="absolute top-3 left-1/2 transform -translate-x-1/2 h-6 border-l border-dashed border-secondary-300"
          ></div>
        </div>
        <span class="text-secondary-700">{{ destination }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  planTitle: string
  participants: number
  duration: number
  destinations: string[]
  rotation?: 'left' | 'right' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  rotation: 'none',
})

const rotationClass = computed(() => {
  switch (props.rotation) {
    case 'left':
      return '-rotate-3 hover:rotate-0'
    case 'right':
      return 'rotate-3 hover:rotate-0'
    default:
      return 'hover:rotate-1'
  }
})
</script>
