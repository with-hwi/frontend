<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <font-awesome-icon :icon="getCategoryIcon(attraction.category1)" class="text-primary-600" />
      <h3 class="text-lg font-semibold text-primary-800 leading-tight">{{ attraction.title }}</h3>
    </div>

    <div v-if="attraction.firstImageUrl" class="rounded-lg overflow-hidden">
      <img
        :src="attraction.firstImageUrl"
        :alt="attraction.title"
        class="w-full h-32 object-cover"
      />
    </div>

    <div class="space-y-2 text-sm">
      <div v-if="attraction.address1" class="flex items-start gap-2">
        <div class="inline-flex items-center justify-center w-6 h-6 rounded-md bg-secondary-100">
          <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="text-secondary-700 text-xs" />
        </div>
        <span class="text-secondary-800 leading-relaxed">
          {{ attraction.address1 }} {{ attraction.address2 || '' }}
        </span>
      </div>

      <div v-if="attraction.telephone" class="flex items-center gap-2">
        <div class="inline-flex items-center justify-center w-6 h-6 rounded-md bg-secondary-100">
          <font-awesome-icon :icon="['fas', 'phone']" class="text-secondary-700 text-xs" />
        </div>
        <span class="text-secondary-800">{{ attraction.telephone }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AttractionItem } from '@/types/tour'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps<{
  attraction: AttractionItem
}>()

// 카테고리별 아이콘 매핑 함수
const getCategoryIcon = (categoryCode: string | undefined): string => {
  switch (categoryCode) {
    case 'A01': // 자연
      return 'fa-tree'
    case 'A02': // 인문(문화/예술/역사)
      return 'fa-landmark'
    case 'A03': // 레포츠
      return 'fa-dumbbell'
    case 'A04': // 쇼핑
      return 'fa-shopping-bag'
    case 'A05': // 음식
      return 'fa-utensils'
    case 'B02': // 숙박
      return 'fa-bed'
    case 'C01': // 추천코스
      return 'fa-route'
    default:
      return 'fa-map-marker-alt' // 기본 위치 아이콘
  }
}
</script>

<style scoped></style>
