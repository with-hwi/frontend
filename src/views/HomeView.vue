<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Vue3Lottie } from 'vue3-lottie'
import HeroBanner from '@/components/home/HeroBanner.vue'
import TravelPlanMapCard from '@/components/home/TravelPlanMapCard.vue'
import ServiceSection from '@/components/home/ServiceSection.vue'
import ServiceImagePlan from '@/components/home/ServiceImagePlan.vue'
import ServiceImageAI from '@/components/home/ServiceImageAI.vue'
import ServiceImageCollaborate from '@/components/home/ServiceImageCollaborate.vue'
import logoLottie from '@/assets/trabuddy/logo_text_lottie.json'
import { usePlanModalStore } from '@/stores/planModalStore'
import { useInviteModalStore } from '@/stores/inviteModalStore'

const route = useRoute()
const router = useRouter()
const planModalStore = usePlanModalStore()
const inviteModalStore = useInviteModalStore()

const navigateToSearch = () => {
  router.push('/search')
}

// 플랜 생성 모달 열기
const openCreatePlan = () => {
  planModalStore.openCreatePlanModal()
}

// 컴포넌트 마운트 시 초대 코드 확인
onMounted(() => {
  inviteModalStore.checkInviteCode(route, router)
})
</script>

<template>
  <div class="bg-gray-50">
    <!-- 히어로 섹션 -->
    <section
      class="sticky overflow-hidden min-h-screen flex items-center pt-16 top-0 z-10 shadow-2xl"
    >
      <!-- 배경 배너 -->
      <HeroBanner />

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <!-- PC용 Lottie 로고 애니메이션 (absolute positioning) -->
        <div class="hidden lg:block absolute -top-[10%] left-0 z-20">
          <Vue3Lottie
            :animationData="logoLottie"
            :height="140"
            :width="560"
            :loop="false"
            :autoplay="true"
            class="drop-shadow-2xl"
            style="filter: brightness(0) invert(1)"
          />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-8">
            <!-- 모바일/태블릿용 Lottie 로고 애니메이션 (자연스러운 흐름) -->
            <div class="mb-16 lg:hidden">
              <Vue3Lottie
                :animationData="logoLottie"
                :height="80"
                :width="320"
                :loop="false"
                :autoplay="true"
                class="drop-shadow-2xl sm:w-[400px] sm:h-[100px] md:w-[480px] md:h-[120px]"
                style="filter: brightness(0) invert(1)"
              />
            </div>

            <div class="space-y-4">
              <h1
                class="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl"
              >
                함께 만드는<br />
                <span class="text-primary-200">특별한 여행</span>
              </h1>
              <p class="text-xl text-white/90 leading-relaxed drop-shadow-lg">
                Trabuddy와 함께 친구들과 완벽한 여행 계획을 세우고,<br />
                잊지 못할 추억을 만들어보세요.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              <button @click="navigateToSearch" class="btn-primary">여행지 찾기</button>
              <button @click="openCreatePlan" class="btn-transparent">플랜 만들기</button>
            </div>
          </div>

          <!-- 예시 플랜 맵 카드 -->
          <div class="relative flex justify-center">
            <TravelPlanMapCard
              :route-points="[
                { name: '성산일출봉', x: 25, y: 40 },
                { name: '우도', x: 45, y: 30 },
                { name: '카페거리', x: 65, y: 60 },
              ]"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 서비스 소개 섹션 -->
    <div class="sticky top-0 z-20">
      <ServiceSection
        title="AI가 추천하는"
        highlight-text="맞춤형 여행지"
        description="당신의 취향을 분석해서 딱 맞는 여행지를 찾아드려요.<br/>더 이상 어디로 갈지 고민하지 마세요."
        color-scheme="primary"
        background-color="bg-white"
      >
        <template #image>
          <ServiceImageAI />
        </template>
      </ServiceSection>
    </div>

    <div class="sticky top-0 z-30">
      <ServiceSection
        title="여행 플랜,"
        highlight-text="이제 간단하게"
        description="복잡한 일정 관리는 그만.<br/>누구나 쉽게, 한 눈에 보이는 여행 계획을 세울 수 있어요."
        color-scheme="accent"
        background-color="bg-secondary-50"
        :reversed="true"
      >
        <template #image>
          <ServiceImagePlan />
        </template>
      </ServiceSection>
    </div>

    <div class="sticky top-0 z-40">
      <ServiceSection
        title="친구들과"
        highlight-text="함께 만드는 여행"
        description="친구들을 초대해서 계획을 세워보세요.<br/>모두가 만족하는 여행이 완성될 거예요."
        color-scheme="secondary"
        background-color="bg-white"
      >
        <template #image>
          <ServiceImageCollaborate />
        </template>
      </ServiceSection>
    </div>

    <!-- CTA 섹션 -->
    <div class="sticky top-0 z-50">
      <section class="bg-primary-600 py-16 shadow-2xl shadow-(color:--color-primary-600)">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="space-y-6">
            <h2 class="text-3xl md:text-4xl font-bold text-white">지금 바로 시작해보세요!</h2>
            <!-- <p class="text-xl text-primary-100 max-w-2xl mx-auto">
              Trabuddy와 함께라면 여행 계획이 더 이상 스트레스가 아닙니다.
            </p> -->
            <div class="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <!-- <button @click="navigateToSearch" class="btn-primary-reverse">여행지 둘러보기</button> -->
              <button @click="openCreatePlan" class="btn-primary-dark">나의 첫 플랜 만들기</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
