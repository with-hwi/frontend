<template>
  <div class="relative max-w-md mx-auto">
    <!-- 채팅창 컨테이너 -->
    <div class="bg-white rounded-2xl shadow-lg border border-secondary-200 overflow-hidden">
      <!-- 채팅창 헤더 -->
      <div class="bg-primary-50 px-4 py-3 border-b border-secondary-200">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 bg-accent-500 rounded-full"></div>
          <div class="w-2 h-2 bg-secondary-400 rounded-full"></div>
          <div class="w-2 h-2 bg-secondary-400 rounded-full"></div>
          <!-- <span class="text-secondary-600 text-sm font-medium ml-2">Trabuddy AI</span> -->
        </div>
      </div>

      <!-- 채팅 메시지들 -->
      <div class="p-4 space-y-4 max-h-96 overflow-y-auto">
        <!-- 사용자 메시지 -->
        <div class="flex justify-end">
          <div class="max-w-[75%]">
            <div class="bg-primary-500 text-white px-4 py-3 rounded-2xl rounded-tr-md">
              <p class="text-sm">4명이서 갈만한 힐링 여행지를 추천해줘.</p>
            </div>
          </div>
        </div>

        <!-- AI 응답 -->
        <div class="flex gap-3">
          <!-- AI 프로필 아이콘 -->
          <div
            class="flex-shrink-0 w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center"
          >
            <img
              src="/images/trabuddy/symbol.png"
              alt="Trabuddy 로고"
              class="transition-all duration-300 ease-out will-change-transform"
            />
          </div>

          <div class="max-w-[75%]">
            <div class="bg-secondary-100 text-secondary-800 px-4 py-3 rounded-2xl rounded-tl-md">
              <!-- <p class="text-sm font-medium text-accent-600 mb-1">Trabuddy AI</p> -->
              <p class="text-sm">당신에게 딱 맞는 여행지를 찾았어요!</p>
            </div>
          </div>
        </div>

        <!-- 추천 여행지 목록 -->
        <div class="flex gap-3">
          <div class="w-8"></div>
          <!-- AI 아바타 공간 유지 -->
          <div class="flex-1">
            <div class="bg-white border border-secondary-200 rounded-xl p-4 shadow-sm">
              <!-- <h4 class="text-sm font-semibold text-secondary-800 mb-3">🏝️ 제주도 힐링 코스</h4> -->
              <div class="space-y-2">
                <div
                  class="flex items-center gap-3 p-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
                >
                  <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span class="text-sm text-secondary-700">성산일출봉</span>
                  <span class="text-xs text-secondary-500 ml-auto">일출 명소</span>
                </div>
                <div
                  class="flex items-center gap-3 p-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
                >
                  <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span class="text-sm text-secondary-700">우도</span>
                  <span class="text-xs text-secondary-500 ml-auto">섬 투어</span>
                </div>
                <div
                  class="flex items-center gap-3 p-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
                >
                  <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span class="text-sm text-secondary-700">카페거리</span>
                  <span class="text-xs text-secondary-500 ml-auto">힐링 카페</span>
                </div>
              </div>

              <!-- <div class="mt-3 pt-3 border-t border-secondary-100">
                <button
                  class="w-full bg-primary-500 hover:bg-primary-600 text-white text-sm py-2 px-3 rounded-lg transition-colors"
                >
                  상세 일정 보기
                </button>
              </div> -->
            </div>
          </div>
        </div>
      </div>

      <!-- 입력창 (시각적 효과용) -->
      <!-- <div class="border-t border-secondary-200 p-3">
        <div class="flex items-center gap-2 bg-secondary-50 rounded-full px-4 py-2">
          <span class="text-secondary-400 text-sm flex-1">메시지를 입력하세요...</span>
          <div class="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
        </div>
      </div> -->
    </div>

    <!-- 떠다니는 아이콘들 (배경 장식) -->
    <div
      class="absolute -top-6 -right-6 w-12 h-12 bg-accent-200 rounded-full opacity-20 animate-pulse"
    ></div>
    <div
      class="absolute -bottom-4 -left-4 w-8 h-8 bg-primary-200 rounded-full opacity-30 animate-pulse"
      style="animation-delay: 1s"
    ></div>
    <div
      class="absolute top-1/3 -right-8 w-6 h-6 bg-secondary-300 rounded-full opacity-25 animate-pulse"
      style="animation-delay: 2s"
    ></div>
  </div>
</template>

<script setup lang="ts">
// 컴포넌트에 특별한 로직이 필요하지 않으므로 빈 setup 함수
</script>

<style scoped>
/* 커스텀 애니메이션 */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 3s ease-in-out infinite;
}
</style>
