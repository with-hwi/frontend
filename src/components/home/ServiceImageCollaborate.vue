<template>
  <div class="relative max-w-md mx-auto">
    <!-- 말풍선 -->
    <div class="relative bg-white rounded-2xl shadow-xl p-6 border-2 border-secondary-200">
      <!-- 말풍선 꼬리 -->
      <div
        class="absolute -bottom-3 left-8 w-6 h-6 bg-white border-r-2 border-b-2 border-secondary-200 transform rotate-45"
      ></div>

      <!-- 프로필과 제목, 메시지 -->
      <div class="flex flex-col items-start gap-4">
        <!-- 제목 -->
        <div class="flex flex-row gap-4">
          <!-- 현석님 프로필 -->
          <div
            class="flex-shrink-0 w-12 h-12 bg-secondary-400 rounded-full flex items-center justify-center"
          >
            <span class="text-sm font-bold text-white">현석</span>
          </div>
          <div class="mb-3">
            <h3 class="text-lg font-semibold text-secondary-800 mb-0.5">현석님</h3>
            <p class="text-secondary-600 text-sm">으로부터 초대가 도착했어요.</p>
          </div>
        </div>

        <!-- 메시지 내용 -->
        <div class="flex-1 w-full">
          <!-- 여행 정보 카드 -->
          <div class="bg-secondary-100 rounded-xl p-4 mb-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-accent-200 rounded-lg flex items-center justify-center">
                <span class="text-lg">🏝️</span>
              </div>
              <div>
                <h4 class="font-semibold text-secondary-800">제주도 힐링 여행</h4>
                <p class="text-xs text-secondary-600">3월 15일 - 3월 18일</p>
              </div>
            </div>

            <div class="space-y-1">
              <!-- <div class="text-xs text-secondary-700">📍 성산일출봉, 우도, 카페거리</div> -->
              <div class="flex flex-row gap-2 text-xs text-secondary-600">
                <span>👥</span>
                <div>현재 3명 참여 중</div>
              </div>
            </div>
          </div>

          <!-- 질문 -->
          <p class="text-secondary-600 font-medium text-center mb-4">참여하시겠습니까?</p>

          <!-- 버튼들 -->
          <div class="flex gap-3">
            <button
              class="flex-1 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              물론이죠!
            </button>
            <button
              class="flex-1 bg-secondary-600 hover:bg-secondary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              좋아요!
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 컴포넌트에 특별한 로직이 필요하지 않으므로 빈 setup 함수
</script>

<style scoped>
/* 떠다니는 애니메이션 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-15px) rotate(180deg);
    opacity: 0.7;
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}
</style>
