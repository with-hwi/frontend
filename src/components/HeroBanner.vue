<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentImageIndex = ref(0)
const isImageLoaded = ref(false)

const bannerImages = [
  '/images/main/banner1.webp',
  '/images/main/banner2.webp',
  '/images/main/banner3.webp',
  '/images/main/banner4.webp',
  '/images/main/banner5.webp',
  '/images/main/banner6.webp',
  '/images/main/banner7.webp',
  '/images/main/banner8.webp',
  '/images/main/banner9.webp',
  '/images/main/banner10.webp',
]

let intervalId: number | null = null

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % bannerImages.length
}

onMounted(() => {
  // 첫 번째 이미지 로드 완료 후 자동 슬라이드 시작
  const firstImage = new Image()
  firstImage.onload = () => {
    isImageLoaded.value = true
    // 3초마다 이미지 변경
    intervalId = window.setInterval(nextImage, 5000)
  }
  firstImage.src = bannerImages[0]
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <!-- 배경 이미지들 -->
    <div
      v-for="(image, index) in bannerImages"
      :key="image"
      class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
      :class="{
        'opacity-100': currentImageIndex === index && isImageLoaded,
        'opacity-0': currentImageIndex !== index || !isImageLoaded,
      }"
    >
      <img
        :src="image"
        :alt="`배너 이미지 ${index + 1}`"
        class="w-full h-full object-cover"
        loading="lazy"
      />
    </div>

    <!-- 어두운 오버레이 (텍스트 가독성을 위해) -->
    <div class="absolute inset-0 bg-black/30"></div>

    <!-- 그라디언트 오버레이 -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-primary-600/30"
    ></div>

    <!-- 이미지 인디케이터 -->
    <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
      <button
        v-for="(_, index) in bannerImages"
        :key="index"
        @click="currentImageIndex = index"
        class="btn-icon-indicator"
        :class="{
          'btn-icon-indicator-active': currentImageIndex === index,
          'btn-icon-indicator-inactive': currentImageIndex !== index,
        }"
        :aria-label="`배너 이미지 ${index + 1}번으로 이동`"
      />
    </div>
  </div>
</template>
