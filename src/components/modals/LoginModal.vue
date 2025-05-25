<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { useLoginModalStore } from '@/stores/loginModalStore'

// 로그인 모달 store 사용
const loginModalStore = useLoginModalStore()

// 소셜 로그인 프로바이더 정보
const socialProviders = [
  {
    id: 'google' as const,
    name: 'Google',
    icon: '/images/social/google.svg',
    bgColor: 'bg-white',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300 hover:border-gray-400 border',
  },
  {
    id: 'kakao' as const,
    name: '카카오',
    icon: '/images/social/kakao.png',
    bgColor: 'bg-[#fee500]',
    textColor: 'text-gray-900',
    borderColor: '',
  },
  {
    id: 'naver' as const,
    name: '네이버',
    icon: '/images/social/naver.png',
    bgColor: 'bg-[#05c759]',
    textColor: 'text-white',
    borderColor: '',
  },
]
</script>

<template>
  <!-- PrimeVue 로그인 모달 -->
  <Dialog
    v-model:visible="loginModalStore.isLoginModalVisible"
    modal
    header=" "
    :style="{ width: '24rem' }"
    :closable="true"
    @hide="loginModalStore.closeLoginModal"
    class="mx-4"
  >
    <div class="space-y-4">
      <!-- 로고 이미지 -->
      <div class="text-center mb-6">
        <img src="/images/trabuddy/symbol.png" alt="Trabuddy 심볼" class="w-48 h-48 mx-auto mb-4" />
      </div>

      <!-- 소셜 로그인 버튼들 -->
      <div class="space-y-3">
        <button
          v-for="provider in socialProviders"
          :key="provider.id"
          @click="loginModalStore.handleSocialLogin(provider.id)"
          class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium cursor-pointer"
          :class="[provider.bgColor, provider.textColor, provider.borderColor]"
        >
          <!-- 소셜 로그인 아이콘 -->
          <img :src="provider.icon" class="w-4 h-4" />
          <span>{{ provider.name }}로 로그인하기</span>
        </button>
      </div>

      <!-- 구분선 -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-secondary-200"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-white px-2 text-secondary-500">또는</span>
        </div>
      </div>

      <!-- 이메일 로그인 (추후 구현용) -->
      <button
        class="w-full bg-secondary-100 hover:bg-secondary-200 text-secondary-800 px-4 py-3 rounded-lg border border-secondary-300 hover:border-secondary-400 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-300"
        disabled
      >
        이메일로 로그인
      </button>

      <!-- 개인정보 처리방침 -->
      <div class="text-center mt-6">
        <p class="text-xs text-secondary-500">
          로그인하시면
          <a href="#" class="text-primary-600 hover:text-primary-700 underline">
            개인정보 처리방침</a
          >과
          <a href="#" class="text-primary-600 hover:text-primary-700 underline"> 서비스 이용약관</a
          >에<br />
          동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  </Dialog>
</template>

<style scoped></style>
