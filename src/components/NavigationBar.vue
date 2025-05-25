<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { usePlanModalStore } from '@/stores/planModalStore'

const route = useRoute()
const isScrolled = ref(false)
const planModalStore = usePlanModalStore()

const isTransparent = ref(true)
const isHomePage = computed(() => route.name === 'home')

// 네비게이션 라우트 목록
const routes = [
  { name: 'home', path: '/', label: '홈' },
  { name: 'search', path: '/search', label: '여행지 검색' },
  { name: 'plan', path: '/plan/0', label: '플랜' },
]
// <RouterLink to="/">Home</RouterLink>
// <RouterLink to="/about">About</RouterLink>
// <RouterLink to="/search">여행지 검색</RouterLink>
// <RouterLink to="/plan/0">여행 계획</RouterLink>
// <a @click="openCreatePlanModal" class="cursor-pointer">계획 생성</a>

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

watch(
  [isHomePage, isScrolled],
  () => {
    setTimeout(() => {
      isTransparent.value = isHomePage.value && !isScrolled.value
    })
  },
  { immediate: true },
)

const navLinkClasses = computed(() => {
  if (isTransparent.value) {
    return '!text-primary-600'
  } else {
    return '!text-primary-300 !font-bold'
  }
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <!-- 배경이 투명할 경우 가독성을 위해 검은 그라데이션 배경 표시 -->
  <header
    class="fixed top-0 left-0 right-0 z-50 will-change-transform"
    :class="{
      'bg-white/90 backdrop-blur-md shadow-sm translate-y-0': !isTransparent,
      'bg-gradient-to-b from-black/30 to-transparent -translate-y-0': isTransparent,
    }"
    style="transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  >
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex relative justify-between items-center nav-height">
        <!-- 서비스 로고 -->
        <div class="flex items-center">
          <RouterLink
            to="/"
            class="flex items-center space-x-2 text-2xl font-bold transition-all duration-300 ease-out will-change-transform"
            :class="{
              'text-primary-700 transform translate-x-0': !isTransparent,
              'text-white drop-shadow-lg transform translate-x-0': isTransparent,
              'opacity-0 pointer-events-none': isTransparent,
              'opacity-100 pointer-events-auto': !isTransparent,
            }"
          >
            <!-- 서비스 로고는 배경이 투명하지 않을 때만 표시 -->
            <img
              src="/images/trabuddy/logo.png"
              alt="Trabuddy 로고"
              class="h-12 transition-all duration-300 ease-out will-change-transform"
            />
          </RouterLink>
        </div>

        <!-- 네비게이션 메뉴 -->
        <div class="hidden absolute inset-0 justify-self-center sm:flex items-center space-x-8">
          <RouterLink
            v-for="route in routes"
            :to="route.path"
            :key="route.name"
            class="px-3 py-2 rounded-md text-md font-medium transition-all duration-300 ease-out will-change-transform"
            :class="{
              'text-gray-700 hover:text-primary-600 hover:bg-primary-50': !isTransparent,
              'text-white/90 hover:text-white hover:bg-white/10 drop-shadow-sm': isTransparent,
            }"
            :active-class="navLinkClasses"
          >
            {{ route.label }}
          </RouterLink>

          <!-- 플랜 생성 버튼 -->
          <button
            @click="planModalStore.openCreatePlanModal"
            class="px-3 py-2 rounded-md text-md font-medium transition-all duration-300 ease-out will-change-transform cursor-pointer"
            :class="{
              'text-gray-700 hover:text-primary-600 hover:bg-primary-50': !isTransparent,
              'text-white/90 hover:text-white hover:bg-white/10 drop-shadow-sm': isTransparent,
            }"
          >
            플랜 생성
          </button>
        </div>

        <!-- 프로필 버튼 -->
        <div class="flex items-center space-x-3">
          <!-- 플랜 생성 CTA 버튼 (모바일에서도 표시) -->
          <button
            @click="planModalStore.openCreatePlanModal"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out"
            :class="{
              'bg-accent-500 hover:bg-accent-600 text-white border border-transparent':
                !isTransparent,
              'bg-accent-500/90 hover:bg-accent-500 text-white border border-accent-400/50 hover:border-accent-400':
                isTransparent,
            }"
          >
            + 플랜 생성
          </button>

          <button
            class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 ease-in-out"
            :class="{
              'bg-primary-600 hover:bg-primary-700 border border-transparent': !isTransparent,
              'bg-white/20 hover:bg-white/20 border border-white/50 hover:border-white/70':
                isTransparent,
            }"
          >
            로그인
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>
