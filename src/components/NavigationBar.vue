<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { usePlanModalStore } from '@/stores/planModalStore'
import { useLoginModalStore } from '@/stores/loginModalStore'
import { useUserStore } from '@/stores/userStore'
import MockProfileIcon from '@/components/plan/MockProfileIcon.vue'
import Popover from 'primevue/popover'
import { logout } from '@/services/authService'

const route = useRoute()
const isScrolled = ref(false)
const planModalStore = usePlanModalStore()
const loginModalStore = useLoginModalStore()
const userStore = useUserStore()
const profilePopover = ref()

const isTransparent = ref(true)
const isHomePage = computed(() => route.name === 'home')

// 로그인 여부 확인
const isLoggedIn = computed(() => userStore.userInfo !== null)

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

const activeLinkClasses = computed(() => {
  if (isTransparent.value) {
    return '!text-primary-600'
  } else {
    return '!text-primary-500'
  }
})

// 프로필 메뉴 토글
const toggleProfileMenu = (event: Event) => {
  profilePopover.value.toggle(event)
}

// 로그아웃 처리
const handleLogout = () => {
  logout()
  profilePopover.value.hide()
}

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
            :active-class="activeLinkClasses"
          >
            {{ route.label }}
          </RouterLink>

          <!-- 새 플랜 만들기 버튼 (로그인된 경우에만 표시) -->
          <button
            v-if="isLoggedIn"
            @click="planModalStore.openCreatePlanModal"
            class="px-3 py-2 rounded-md text-md font-medium transition-all duration-300 ease-out will-change-transform"
            :class="{
              'text-gray-700 hover:text-primary-600 hover:bg-primary-50': !isTransparent,
              'text-white/90 hover:text-white hover:bg-white/10 drop-shadow-sm': isTransparent,
            }"
          >
            새 플랜 만들기
          </button>
        </div>

        <!-- 프로필 버튼 -->
        <div class="flex items-center space-x-3">
          <!-- 로그인된 경우: 새 플랜 만들기 버튼과 프로필 아이콘 -->
          <template v-if="isLoggedIn">
            <!-- 사용자 프로필 아이콘 -->
            <MockProfileIcon
              :nickname="userStore.userInfo?.nickname || '사용자'"
              :size="36"
              class="cursor-pointer hover:ring-2 hover:ring-white/50 transition-all duration-200"
              @click="toggleProfileMenu"
            />

            <!-- 프로필 메뉴 팝오버 -->
            <Popover ref="profilePopover" class="w-48">
              <div
                class="bg-white rounded-lg shadow-lg border border-secondary-200 overflow-hidden"
              >
                <div class="py-1">
                  <!-- 프로필 페이지로 이동 (아직 구현 안됨) -->
                  <button
                    class="w-full px-4 py-3 text-left text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-200 flex items-center space-x-2"
                    disabled
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span class="text-secondary-400">프로필 (준비중)</span>
                  </button>

                  <!-- 구분선 -->
                  <div class="border-t border-secondary-200 my-1"></div>

                  <!-- 로그아웃 -->
                  <button
                    @click="handleLogout"
                    class="w-full px-4 py-3 text-left text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>
            </Popover>
          </template>

          <!-- 로그인되지 않은 경우: 로그인 버튼만 표시 -->
          <template v-else>
            <button
              @click="loginModalStore.openLoginModal"
              class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 ease-in-out"
              :class="{
                'bg-primary-600 hover:bg-primary-700 border border-transparent': !isTransparent,
                'bg-white/20 hover:bg-white/30 border border-white/50 hover:border-white/70':
                  isTransparent,
              }"
            >
              로그인
            </button>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>
