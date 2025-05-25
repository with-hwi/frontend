<script setup lang="ts">
import { ref } from 'vue'

const travelRoutes = ref([
  {
    id: 1,
    name: '성산일출봉',
    startTime: '09:00',
    endTime: '11:00',
    duration: '2시간',
    x: 25,
    y: 40,
  },
  { id: 2, name: '우도', startTime: '12:00', endTime: '15:00', duration: '3시간', x: 45, y: 30 },
  {
    id: 3,
    name: '카페거리',
    startTime: '16:00',
    endTime: '18:00',
    duration: '2시간',
    x: 65,
    y: 60,
  },
])
</script>

<template>
  <div class="w-full max-w-xl max-h-96 mx-auto">
    <!-- 단일 카드 -->
    <div class="h-full bg-white rounded-2xl shadow-lg border-2 border-accent-100 overflow-hidden">
      <div class="flex flex-row h-full min-h-48">
        <!-- 왼쪽 사이드바: 여행지 경로 목록 -->
        <div class="w-56 bg-accent-50 border-r border-accent-100 p-6">
          <h3 class="text-lg font-bold text-accent-700 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
            여행 플랜
          </h3>

          <div class="space-y-4">
            <div v-for="(route, index) in travelRoutes" :key="route.id" class="relative">
              <!-- 연결선 (마지막 항목 제외) -->
              <div
                v-if="index < travelRoutes.length - 1"
                class="absolute left-2.75 top-8 w-0.5 h-10 border-l-2 border-dashed border-accent-300"
              ></div>

              <!-- 여행지 항목 -->
              <div class="flex items-start space-x-3">
                <!-- 순서 번호 -->
                <div
                  class="flex-shrink-0 w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center font-bold text-sm"
                >
                  {{ index + 1 }}
                </div>

                <!-- 여행지 정보 -->
                <div class="flex-1 bg-white rounded-lg p-3 shadow-sm border border-accent-200">
                  <h4 class="font-semibold text-accent-800 text-sm mb-1">{{ route.name }}</h4>
                  <div class="space-y-1">
                    <div class="flex items-center text-xs text-accent-600">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      {{ route.startTime }} - {{ route.endTime }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 사이드바 하단 요약 -->
          <!-- <div class="mt-6 p-3 bg-white rounded-lg border border-accent-200">
            <div class="text-xs text-accent-600 mb-1">총 소요시간</div>
            <div class="text-lg font-bold text-accent-700">7시간</div>
            <div class="text-xs text-accent-500 mt-1">3개 장소</div>
          </div> -->
        </div>

        <!-- 오른쪽: 지도 영역 -->
        <div class="flex-1">
          <!--  지도 -->
          <img class="h-full object-cover" src="/images/main/service_plan_example.png" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 부드러운 호버 효과 */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
}
</style>
