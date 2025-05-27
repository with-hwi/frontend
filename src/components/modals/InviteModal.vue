<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { Vue3Lottie } from 'vue3-lottie'
import { useInviteModalStore } from '@/stores/inviteModalStore'
import acceptInviteSuccessAnimation from '@/assets/anim/accept_invite_success.json'

// 초대 모달 store 사용
const inviteModalStore = useInviteModalStore()

// Lottie 애니메이션 완료 처리
const onAnimationComplete = () => {
  setTimeout(() => {
    inviteModalStore.onSuccessAnimationComplete()
  }, 500)
}
</script>

<template>
  <!-- PrimeVue 초대 확인 모달 -->
  <Dialog
    v-model:visible="inviteModalStore.isVisible"
    modal
    header=" "
    :style="{ width: '28rem' }"
    :closable="!inviteModalStore.isSuccess && !inviteModalStore.isLoading"
    @hide="inviteModalStore.closeModal"
    class="mx-4"
  >
    <!-- 성공 애니메이션 -->
    <div v-if="inviteModalStore.isSuccess" class="flex flex-col items-center justify-center py-8">
      <Vue3Lottie
        :animationData="acceptInviteSuccessAnimation"
        :height="200"
        :width="200"
        :loop="false"
        :speed="0.5"
        @onComplete="onAnimationComplete"
        class="mb-4"
      />
      <h3 class="text-lg font-semibold text-primary-700 mb-2">초대를 수락했어요!</h3>
      <p class="text-sm text-secondary-600 text-center">어떤 여행이 될지 벌써 두근거려요.</p>
    </div>

    <!-- 로딩 중 -->
    <div
      v-else-if="inviteModalStore.isLoading && !inviteModalStore.hasInviteInfo"
      class="flex flex-col items-center justify-center py-8"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p class="text-sm text-secondary-600">초대 정보를 가져오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="inviteModalStore.error" class="flex flex-col items-center justify-center py-8">
      <div class="text-accent-600 mb-4">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 19.5c-.77.833.192 2.5 1.732 2.5z"
          ></path>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-accent-700 mb-2">오류가 발생했습니다</h3>
      <p class="text-sm text-secondary-600 text-center mb-6">{{ inviteModalStore.error }}</p>
      <button
        @click="inviteModalStore.closeModal"
        class="bg-secondary-100 hover:bg-secondary-200 text-secondary-800 px-6 py-2 rounded-lg font-medium transition-all duration-200"
      >
        닫기
      </button>
    </div>

    <!-- 초대 정보 표시 -->
    <div v-else-if="inviteModalStore.hasInviteInfo" class="space-y-6">
      <!-- 초대 정보 -->
      <div class="flex flex-col items-center text-center">
        <img src="/images/trabuddy/symbol.png" alt="Trabuddy 로고" class="w-32 h-32" />
        <p class="text-lg text-secondary-600 mb-4">
          <span class="font-bold text-primary-600">{{ inviteModalStore.inviteInfo?.nickname }}</span
          >님이<br />여행 플랜에 초대했습니다.
        </p>

        <!-- 플랜 정보 -->
        <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <h4 class="font-semibold text-primary-800 text-xl">
            {{ inviteModalStore.inviteInfo?.title }}
          </h4>
        </div>

        <p class="text-md text-secondary-600">같이 떠나시겠어요?</p>
      </div>

      <!-- 버튼 그룹 -->
      <div class="flex justify-center gap-3 pt-4">
        <button
          @click="inviteModalStore.rejectInvitation"
          :disabled="inviteModalStore.isLoading"
          class="bg-secondary-100 hover:bg-secondary-200 text-secondary-800 px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-300 disabled:opacity-50"
        >
          거절
        </button>
        <button
          @click="inviteModalStore.acceptInvitation"
          :disabled="inviteModalStore.isLoading"
          class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
        >
          {{ inviteModalStore.isLoading ? '처리 중...' : '수락' }}
        </button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped></style>
