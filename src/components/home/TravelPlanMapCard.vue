<template>
  <div class="relative w-full max-w-2xl mx-auto">
    <!-- 지도 컨테이너 -->
    <div
      class="relative bg-white rounded-2xl shadow-xl transform transition-transform duration-300 hover:scale-[1.02] p-3"
      :class="rotationClass"
    >
      <!-- 압정 아이콘 -->
      <div class="absolute -top-4 -right-4 z-20">
        <img
          src="/images/home/plan_map_thumbtack.png"
          alt="압정"
          class="w-12 h-12 drop-shadow-lg"
        />
      </div>

      <!-- 지도 이미지와 마커들 -->
      <div class="relative w-full h-80 rounded-xl overflow-hidden">
        <img
          src="/images/home/plan_map_example.png"
          alt="여행 지도"
          class="w-full h-full object-cover"
        />

        <!-- 여행 경로 라인 (SVG) -->
        <svg
          class="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <!-- 점선 경로 -->
          <path
            :d="pathData"
            stroke="#ef4444"
            stroke-width="0.5"
            stroke-dasharray="2,2"
            fill="none"
            opacity="0.8"
          />
        </svg>

        <!-- 여행지 마커들 -->
        <div
          v-for="(destination, index) in routePoints"
          :key="index"
          class="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          :style="{
            left: destination.x + '%',
            top: destination.y + '%',
          }"
        >
          <!-- 마커 원 -->
          <div class="relative">
            <div class="btn-marker">
              <span class="text-white text-sm font-bold">{{ index + 1 }}</span>
            </div>

            <!-- 마커 라벨 -->
            <div
              class="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-md whitespace-nowrap text-xs font-medium text-gray-700 border"
            >
              {{ destination.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface RoutePoint {
  name: string
  x: number // 퍼센트 (0-100)
  y: number // 퍼센트 (0-100)
}

interface Props {
  routePoints: RoutePoint[]
  rotation?: 'left' | 'right' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  rotation: 'none',
})

// 회전 클래스 계산
const rotationClass = computed(() => {
  switch (props.rotation) {
    case 'left':
      return 'rotate-1'
    case 'right':
      return '-rotate-1'
    default:
      return ''
  }
})

// SVG 경로 데이터 생성
const pathData = computed(() => {
  if (props.routePoints.length < 2) return ''

  let path = `M ${props.routePoints[0].x} ${props.routePoints[0].y}`

  for (let i = 1; i < props.routePoints.length; i++) {
    path += ` L ${props.routePoints[i].x} ${props.routePoints[i].y}`
  }

  return path
})
</script>

<style scoped></style>
