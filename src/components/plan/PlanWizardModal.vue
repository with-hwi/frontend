<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { planThemes } from '@/constants/plan_themes'
import Dialog from 'primevue/dialog'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faPlane,
  faUsers,
  faPalette,
  faUserPlus,
  faLightbulb,
  faStar,
  faMapLocationDot,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'

interface Props {
  modelValue: boolean
  initialDescription?: string
  initialPeople?: number
  initialThemeId?: number | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'complete', data: { description: string; people: number; themeId: number }): void
  (e: 'never-show-again'): void
}

const props = withDefaults(defineProps<Props>(), {
  initialDescription: '',
  initialPeople: 1,
  initialThemeId: 0,
})

const emit = defineEmits<Emits>()

// 현재 단계와 애니메이션 방향
const currentStep = ref(1)
const animationDirection = ref<'forward' | 'backward'>('forward')
const totalSteps = 5

// 마법사 데이터
const wizardData = ref({
  description: props.initialDescription,
  people: props.initialPeople,
  themeId: props.initialThemeId ?? 0,
})

// props 변경 감지
watch(
  () => props.initialDescription,
  (newVal) => {
    wizardData.value.description = newVal
  },
)
watch(
  () => props.initialPeople,
  (newVal) => {
    wizardData.value.people = newVal
  },
)
watch(
  () => props.initialThemeId,
  (newVal) => {
    wizardData.value.themeId = newVal ?? 0
  },
)

// 단계별 정보
const stepInfo = computed(() => {
  const steps = [
    {
      title: '여행 설명하기',
      subtitle: '어떤 여행을 계획하고 계신가요?',
      icon: faPlane,
    },
    {
      title: '인원 설정하기',
      subtitle: '몇 명이 함께 여행하시나요?',
      icon: faUsers,
    },
    {
      title: '테마 선택하기',
      subtitle: '어떤 스타일의 여행을 원하시나요?',
      icon: faPalette,
    },
    {
      title: '친구 초대하기',
      subtitle: '함께 계획을 세워보세요!',
      icon: faUserPlus,
    },
    {
      title: '준비 완료!',
      subtitle: '이제 멋진 여행을 계획해보세요!',
      icon: faCheck,
    },
  ]
  return steps[currentStep.value - 1]
})

// 다음 단계로 이동 가능한지 확인
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return true // 설명은 선택사항
    case 2:
      return wizardData.value.people >= 1
    case 3:
      return true // 테마는 선택사항
    case 4:
      return true // 초대는 선택사항
    case 5:
      return true // 준비 완료는 선택사항
    default:
      return false
  }
})

// 단계 이동 함수
const nextStep = () => {
  if (currentStep.value < totalSteps && canProceed.value) {
    animationDirection.value = 'forward'
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    animationDirection.value = 'backward'
    currentStep.value--
  }
}

// 인원수 조정
const incrementPeople = () => {
  wizardData.value.people++
}

const decrementPeople = () => {
  if (wizardData.value.people > 1) {
    wizardData.value.people--
  }
}

// 모달 제어
const closeModal = () => {
  emit('update:modelValue', false)
}

const complete = () => {
  emit('complete', {
    description: wizardData.value.description.trim(),
    people: wizardData.value.people,
    themeId: wizardData.value.themeId,
  })
  closeModal()
}

const neverShowAgain = () => {
  emit('never-show-again')
  closeModal()
}

// 모달 열릴 때 초기화
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      currentStep.value = 1
      animationDirection.value = 'forward'
    }
  },
)

// 파티 폭죽 효과 스타일 생성
const getConfettiStyle = (index: number) => {
  const colors = ['#f07b5c', '#a8a868', '#c9a882', '#f69a80', '#9d9d60', '#ddc0a2']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomDelay = Math.random() * 3
  const randomDuration = 2 + Math.random() * 3
  const randomX = Math.random() * 100
  const isLeft = index % 2 === 0

  return {
    backgroundColor: randomColor,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`,
    left: isLeft ? `${randomX}%` : 'auto',
    right: isLeft ? 'auto' : `${randomX}%`,
  }
}
</script>

<template>
  <Dialog
    :visible="modelValue"
    @update:visible="$emit('update:modelValue', $event)"
    modal
    :closable="false"
    :style="{ width: '480px' }"
    :breakpoints="{ '1024px': '90vw', '768px': '95vw' }"
    class="travel-wizard-modal"
    :pt="{
      mask: { class: 'backdrop-blur-md bg-black/30' },
      root: {
        class: 'shadow-2xl rounded-2xl overflow-hidden border-2 border-secondary-200 relative',
      },
      header: {
        class: 'p-8 pb-0 border-none',
      },
      content: {
        class: 'p-0 overflow-hidden',
      },
      footer: {
        class: '!p-0 border-none',
      },
    }"
  >
    <!-- 파티 폭죽 효과 - 모달 전체 -->
    <div v-if="currentStep === 5" class="confetti-container">
      <div class="confetti" v-for="i in 80" :key="i" :style="getConfettiStyle(i)"></div>
    </div>

    <!-- 커스텀 헤더 -->
    <template #header>
      <div class="w-full">
        <!-- 상단 바 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon :icon="faMapLocationDot" class="text-white text-xl" />
            </div>
            <div>
              <h1 class="text-lg font-bold text-primary-900">새 여행 플랜</h1>
              <p class="text-sm text-secondary-600">몇 가지만 설정하고 시작해보세요</p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="w-8 h-8 flex items-center justify-center text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-all"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- 진행 표시바 -->
        <div class="mb-8">
          <div class="flex items-center justify-between text-sm text-secondary-600 mb-3">
            <span>{{ currentStep }}단계 / {{ totalSteps }}단계</span>
          </div>
          <div class="flex space-x-2">
            <div
              v-for="step in totalSteps"
              :key="step"
              class="flex-1 h-1.5 rounded-full transition-all duration-500 ease-out"
              :class="{
                'bg-primary-500': step <= currentStep,
                'bg-secondary-200': step > currentStep,
              }"
            ></div>
          </div>
        </div>

        <!-- 현재 단계 정보 -->
        <div class="text-center">
          <div
            class="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-full flex items-center justify-center"
          >
            <FontAwesomeIcon :icon="stepInfo.icon" class="text-xl text-primary-600" />
          </div>
          <h2 class="text-xl font-bold text-primary-900 mb-1">{{ stepInfo.title }}</h2>
          <p class="text-secondary-600">{{ stepInfo.subtitle }}</p>
        </div>
      </div>
    </template>

    <!-- 페이지 컨테이너 -->
    <div
      class="relative overflow-hidden transition-[height]"
      :class="[currentStep === 5 ? 'h-32' : 'h-88']"
    >
      <div
        class="flex transition-transform duration-500 ease-out h-full"
        :style="{
          transform: `translateX(-${(currentStep - 1) * 100}%)`,
        }"
      >
        <!-- 1단계: 플랜 설명 -->
        <div class="w-full flex-shrink-0 px-8 py-4 flex flex-col justify-center">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-secondary-800 mb-3">
                여행에 대해 간단히 설명해주세요
              </label>
              <textarea
                v-model="wizardData.description"
                class="w-full px-4 py-4 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all resize-none text-secondary-800 placeholder-secondary-400"
                rows="4"
                placeholder="예: 가족과 함께하는 제주도 힐링 여행, 친구들과의 부산 맛집 투어..."
              ></textarea>
            </div>

            <div class="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 flex items-center justify-center">
                  <FontAwesomeIcon :icon="faLightbulb" class="text-lg text-primary-600" />
                </div>
                <div>
                  <p class="text-sm font-medium text-primary-800 mb-1">선택사항이에요!</p>
                  <p class="text-xs text-primary-600">
                    설명을 작성하면 나중에 플랜을 찾기가 더 쉬워집니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2단계: 인원수 -->
        <div class="w-full flex-shrink-0 px-8 py-4 flex flex-col justify-center">
          <div class="space-y-8">
            <div class="flex items-center justify-center">
              <div class="bg-white border-2 border-secondary-200 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center space-x-8">
                  <button
                    @click="decrementPeople"
                    :disabled="wizardData.people <= 1"
                    class="w-14 h-14 flex items-center justify-center bg-secondary-100 hover:bg-secondary-200 disabled:bg-secondary-50 disabled:text-secondary-400 rounded-2xl text-xl font-bold transition-all shadow-sm hover:shadow-md disabled:shadow-none"
                  >
                    −
                  </button>

                  <div class="text-center min-w-[80px]">
                    <div class="text-5xl font-bold text-primary-900 mb-2">
                      {{ wizardData.people }}
                    </div>
                    <div class="text-sm font-medium text-secondary-600">명</div>
                  </div>

                  <button
                    @click="incrementPeople"
                    class="w-14 h-14 flex items-center justify-center bg-primary-400 hover:bg-primary-500 text-white rounded-2xl text-xl font-bold transition-all shadow-sm hover:shadow-md"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div class="text-center">
              <p class="text-sm text-secondary-600">
                언제든지 참여자를 추가하거나 변경할 수 있어요
              </p>
            </div>
          </div>
        </div>

        <!-- 3단계: 테마 선택 -->
        <div class="w-full flex-shrink-0 px-8 py-4 flex flex-col justify-center">
          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-3 overflow-y-visible">
              <label v-for="theme in planThemes" :key="theme.themeId" class="cursor-pointer group">
                <input
                  type="radio"
                  :value="theme.themeId"
                  v-model="wizardData.themeId"
                  class="sr-only"
                />
                <div
                  class="p-4 border-2 rounded-xl text-center transition-all duration-300 group-hover:shadow-lg"
                  :class="{
                    'border-primary-400 bg-primary-50 shadow-md':
                      wizardData.themeId === theme.themeId,
                    'border-secondary-200 hover:border-secondary-300 bg-white':
                      wizardData.themeId !== theme.themeId,
                  }"
                >
                  <span
                    class="font-semibold transition-colors"
                    :class="{
                      'text-primary-700': wizardData.themeId === theme.themeId,
                      'text-secondary-700 group-hover:text-secondary-800':
                        wizardData.themeId !== theme.themeId,
                    }"
                  >
                    {{ theme.label }}
                  </span>
                </div>
              </label>
            </div>

            <div class="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 flex items-center justify-center">
                  <FontAwesomeIcon :icon="faStar" class="text-lg text-primary-600" />
                </div>
                <div>
                  <p class="text-sm font-medium text-primary-800 mb-1">선택사항이에요!</p>
                  <p class="text-xs text-primary-600">테마는 나중에 언제든지 변경할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4단계: 친구 초대 -->
        <div class="w-full flex-shrink-0 px-8 py-4 flex flex-col justify-center">
          <div class="space-y-6">
            <div class="text-center">
              <h3 class="text-2xl font-bold text-primary-900 mb-3">친구들과 함께 떠나요!</h3>
              <p class="text-secondary-600 mb-8 leading-relaxed">
                초대 링크를 생성하여 친구들에게 공유하고<br />
                함께 여행 계획을 세워보세요
              </p>
            </div>

            <div class="space-y-4">
              <button
                disabled
                class="w-full py-4 px-6 bg-secondary-200 text-secondary-500 rounded-2xl cursor-not-allowed flex items-center justify-center space-x-3 font-semibold transition-all"
                title="준비 중인 기능입니다"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>초대 링크 생성하기</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 5단계: 준비 완료 -->
        <div class="w-full flex-shrink-0 px-8 py-4 flex flex-col justify-center relative">
          <div class="space-y-8 relative z-10">
            <div>
              <button
                @click="complete"
                class="w-full py-5 px-8 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                ✨ 여행 시작하기 ✨
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 푸터 -->
    <template #footer>
      <div class="w-full bg-secondary-50 border-t border-secondary-200">
        <div class="px-8 py-6">
          <div class="flex items-center justify-between">
            <!-- 다시 보지 않기 -->
            <button
              @click="neverShowAgain"
              class="text-sm text-secondary-500 hover:text-secondary-700 transition-colors font-medium"
            >
              다시 보지 않기
            </button>

            <!-- 네비게이션 버튼 -->
            <div class="flex items-center space-x-3">
              <button
                v-if="currentStep > 1"
                @click="prevStep"
                class="px-8 py-3 text-sm font-semibold text-secondary-700 bg-white border-2 border-secondary-200 rounded-xl hover:bg-secondary-50 hover:border-secondary-300 transition-all shadow-sm"
              >
                이전
              </button>

              <button
                v-if="currentStep < totalSteps"
                @click="nextStep"
                :disabled="!canProceed"
                class="px-8 py-3 text-sm font-semibold text-white bg-primary-600 border-2 border-transparent rounded-xl hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {{ currentStep === 1 ? '시작하기' : '다음' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/* 스크롤바 스타일링 */
.travel-wizard-modal :deep(*::-webkit-scrollbar) {
  width: 4px;
}

.travel-wizard-modal :deep(*::-webkit-scrollbar-track) {
  background: transparent;
}

.travel-wizard-modal :deep(*::-webkit-scrollbar-thumb) {
  background: rgba(var(--color-secondary-300));
  border-radius: 2px;
}

.travel-wizard-modal :deep(*::-webkit-scrollbar-thumb:hover) {
  background: rgba(var(--color-secondary-400));
}

/* 파티 폭죽 애니메이션 */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1000;
  border-radius: 1rem;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #f07b5c;
  top: -20px;
  border-radius: 2px;
  animation: confetti-fall linear infinite;
  transform-origin: center;
}

.confetti:nth-child(odd) {
  animation: confetti-fall-rotate linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-50px) rotateX(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(120vh) rotateX(720deg);
    opacity: 0;
  }
}

@keyframes confetti-fall-rotate {
  0% {
    transform: translateY(-50px) rotateY(0deg) rotateX(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(120vh) rotateY(720deg) rotateX(720deg);
    opacity: 0;
  }
}

/* 폭죽 조각 다양한 모양 */
.confetti:nth-child(3n) {
  border-radius: 50%;
  width: 8px;
  height: 8px;
}

.confetti:nth-child(5n) {
  border-radius: 0;
  transform: rotate(45deg);
  width: 12px;
  height: 6px;
}

.confetti:nth-child(7n) {
  border-radius: 2px 8px;
  width: 6px;
  height: 12px;
}
</style>
