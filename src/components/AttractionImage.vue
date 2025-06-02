<template>
  <div class="w-full h-full relative">
    <!-- 이미지가 있는 경우 -->
    <img
      v-if="imageUrl && !imageError"
      :src="imageUrl"
      :alt="item.title"
      class="w-full h-full object-cover"
      @error="handleImageError"
    />

    <!-- 이미지 로딩 중 -->
    <div
      v-else-if="isLoading"
      class="w-full h-full flex items-center justify-center text-secondary-400 bg-secondary-50"
    >
      <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </div>

    <!-- 이미지가 없는 경우 placeholder -->
    <div v-else class="w-full h-full flex items-center justify-center text-secondary-400">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { AttractionItem } from '@/types/tour'
import { getKakaoPlaceImageUrl } from '@/utils/kakaoMap'

interface Props {
  item: AttractionItem
}

const props = defineProps<Props>()

const isLoading = ref(false)
const kakaoImageUrl = ref<string | null>(null)
const imageError = ref(false)

// 최종 표시할 이미지 URL 계산
const imageUrl = computed(() => {
  if (props.item.firstImageUrl) {
    return props.item.firstImageUrl
  }
  return kakaoImageUrl.value
})

// 이미지 로드 에러 처리
const handleImageError = () => {
  imageError.value = true
}

// 카카오 이미지 URL 가져오기
const fetchKakaoImage = async () => {
  // firstImageUrl이 이미 있으면 카카오 API 호출하지 않음
  if (props.item.firstImageUrl) {
    return
  }

  // source가 'kakao'인 경우에만 카카오 API 호출
  if ((props.item as any).source === 'kakao') {
    isLoading.value = true
    try {
      const url = await getKakaoPlaceImageUrl(props.item.contentId)
      kakaoImageUrl.value = url
    } catch (error) {
      console.error('카카오 이미지 가져오기 실패:', error)
      kakaoImageUrl.value = null
    } finally {
      isLoading.value = false
    }
  }
}

// 컴포넌트 마운트 시 이미지 가져오기
onMounted(() => {
  fetchKakaoImage()
})

// item이 변경될 때 이미지 다시 가져오기
watch(
  () => props.item.contentId,
  () => {
    imageError.value = false
    kakaoImageUrl.value = null
    fetchKakaoImage()
  },
)
</script>
