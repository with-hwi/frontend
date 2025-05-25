<script setup lang="ts">
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import { Vue3Lottie } from 'vue3-lottie'
import { usePlanModalStore } from '@/stores/planModalStore'
import createPlanSuccessAnimation from '@/assets/anim/create_plan_success.json'

// 플랜 모달 store 사용
const planModalStore = usePlanModalStore()

// Lottie 애니메이션 완료 처리
const onAnimationComplete = () => {
  // 애니메이션이 완료되면 생성된 플랜 페이지로 이동
  setTimeout(() => {
    planModalStore.navigateToCreatedPlan()
  }, 500)
}
</script>

<template>
  <!-- PrimeVue 플랜 생성 모달 -->
  <Dialog
    v-model:visible="planModalStore.isCreatePlanModalVisible"
    modal
    :header="!planModalStore.isSuccess ? '새 플랜 만들기' : undefined"
    :style="{ width: '28rem' }"
    :closable="!planModalStore.isSuccess"
    @hide="planModalStore.closeCreatePlanModal"
    class="mx-4"
  >
    <!-- 성공 애니메이션 -->
    <div v-if="planModalStore.isSuccess" class="flex flex-col items-center justify-center py-8">
      <Vue3Lottie
        :animationData="createPlanSuccessAnimation"
        :height="200"
        :width="200"
        :loop="false"
        :speed="0.5"
        @onComplete="onAnimationComplete"
        class="mb-4"
      />
      <h3 class="text-lg font-semibold text-primary-700 mb-2">여행 떠날 준비 완료!</h3>
      <!-- <p class="text-sm text-secondary-600 text-center">
        새로운 여행 플랜이 성공적으로 생성되었습니다.<br />
        잠시 후 플랜 페이지로 이동합니다.
      </p> -->
    </div>

    <!-- 플랜 생성 폼 -->
    <form v-else @submit.prevent="planModalStore.handlePlanSubmit" class="space-y-6">
      <!-- 플랜 제목 입력 -->
      <div>
        <label for="title" class="block text-sm font-semibold text-secondary-700 mb-3">
          플랜 제목
        </label>
        <input
          id="title"
          v-model="planModalStore.formData.title"
          type="text"
          required
          class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-primary-50 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
          placeholder="여행 플랜 제목을 입력하세요"
        />
      </div>

      <!-- 날짜 선택 (같은 행에 배치) -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="startDate" class="block text-sm font-semibold text-secondary-700 mb-3">
            시작 날짜
          </label>
          <DatePicker
            id="startDate"
            v-model="planModalStore.formData.startDate"
            dateFormat="yy/mm/dd"
            placeholder="시작 날짜"
            showIcon
            iconDisplay="input"
            fluid
            required
            class="w-full"
            :pt="{
              input: {
                class:
                  'px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-primary-50 focus:ring-2 focus:ring-primary-200 transition-all duration-200',
              },
            }"
          />
        </div>

        <div>
          <label for="endDate" class="block text-sm font-semibold text-secondary-700 mb-3">
            끝 날짜
          </label>
          <DatePicker
            id="endDate"
            v-model="planModalStore.formData.endDate"
            dateFormat="yy/mm/dd"
            placeholder="끝 날짜"
            showIcon
            iconDisplay="input"
            fluid
            required
            class="w-full"
            :pt="{
              input: {
                class:
                  'px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-primary-50 focus:ring-2 focus:ring-primary-200 transition-all duration-200',
              },
            }"
          />
        </div>
      </div>

      <!-- 버튼 그룹 -->
      <div class="flex justify-end gap-3 pt-6">
        <button
          type="button"
          @click="planModalStore.closeCreatePlanModal"
          class="bg-secondary-100 hover:bg-secondary-200 text-secondary-800 px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-300"
        >
          취소
        </button>
        <button
          type="submit"
          :disabled="planModalStore.isLoading"
          class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
        >
          {{ planModalStore.isLoading ? '생성 중...' : '플랜 생성' }}
        </button>
      </div>
    </form>
  </Dialog>
</template>

<style scoped></style>
