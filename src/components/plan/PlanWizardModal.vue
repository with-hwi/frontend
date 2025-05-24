<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { planThemes } from '@/constants/plan_themes'

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

// 현재 단계 (1: 설명, 2: 인원수, 3: 테마, 4: 친구 초대)
const currentStep = ref(1)
const totalSteps = 4

// 마법사 데이터
const wizardData = ref({
  description: props.initialDescription,
  people: props.initialPeople,
  themeId: props.initialThemeId ?? 0, // null이면 첫 번째 테마로 설정
})

// props가 변경되면 wizardData 업데이트
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

// 현재 단계 제목
const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 1:
      return '플랜 설명을 입력해주세요 (선택사항)'
    case 2:
      return '여행 인원을 설정해주세요'
    case 3:
      return '여행 테마를 선택해주세요'
    case 4:
      return '함께할 친구들을 초대해보세요'
    default:
      return ''
  }
})

// 다음 단계로 이동 가능한지 확인
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return true // 설명을 선택사항으로 변경
    case 2:
      return wizardData.value.people >= 1
    case 3:
      return true // 테마는 선택하지 않아도 됨
    case 4:
      return true // 초대는 선택사항
    default:
      return false
  }
})

// 단계 이동
const nextStep = () => {
  if (currentStep.value < totalSteps && canProceed.value) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
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

// 모달 닫기
const closeModal = () => {
  emit('update:modelValue', false)
}

// 완료
const complete = () => {
  emit('complete', {
    description: wizardData.value.description.trim(),
    people: wizardData.value.people,
    themeId: wizardData.value.themeId,
  })
  closeModal()
}

// 다시 보지 않기
const neverShowAgain = () => {
  emit('never-show-again')
  closeModal()
}

// 모달이 열릴 때 첫 번째 단계로 리셋
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      currentStep.value = 1
    }
  },
)
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <!-- 헤더 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">플랜 설정</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- 진행 표시기 -->
        <div class="mt-4">
          <div class="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{{ currentStep }} / {{ totalSteps }}</span>
            <span>{{ Math.round((currentStep / totalSteps) * 100) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 본문 - 고정 높이와 슬라이드 애니메이션 -->
      <div class="px-6 py-6 h-[420px] overflow-hidden relative">
        <h3 class="text-lg font-medium text-gray-900 mb-6 text-center">
          {{ stepTitle }}
        </h3>

        <!-- 슬라이드 컨테이너 -->
        <div
          class="flex transition-transform duration-300 ease-in-out h-full"
          :style="{ transform: `translateX(-${(currentStep - 1) * 100}%)` }"
        >
          <!-- 1단계: 플랜 설명 -->
          <div class="w-full flex-shrink-0 space-y-4">
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                플랜 설명 (선택사항)
              </label>
              <textarea
                id="description"
                v-model="wizardData.description"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                rows="4"
                placeholder="어떤 여행을 계획하고 계신가요? 간단히 설명해주세요."
              ></textarea>
            </div>
            <p class="text-sm text-gray-500">
              예: "가족과 함께하는 제주도 2박 3일 여행", "친구들과의 부산 먹방 투어"
            </p>
          </div>

          <!-- 2단계: 인원수 -->
          <div class="w-full flex-shrink-0 space-y-6">
            <div class="text-center">
              <label class="block text-sm font-medium text-gray-700 mb-4"> 여행 인원수 </label>
              <div class="flex items-center justify-center space-x-6">
                <button
                  @click="decrementPeople"
                  :disabled="wizardData.people <= 1"
                  class="w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-full text-xl font-bold transition-colors"
                >
                  -
                </button>
                <div class="min-w-[4rem] text-center">
                  <span class="text-3xl font-bold text-gray-900">{{ wizardData.people }}</span>
                  <p class="text-sm text-gray-500 mt-1">명</p>
                </div>
                <button
                  @click="incrementPeople"
                  class="w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-xl font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-500 text-center">
              나중에 참여자를 추가하거나 변경할 수 있습니다.
            </p>
          </div>

          <!-- 3단계: 테마 선택 -->
          <div class="w-full flex-shrink-0 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                여행 테마 (선택사항)
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label
                  v-for="theme in planThemes"
                  :key="theme.themeId"
                  class="relative cursor-pointer"
                >
                  <input
                    type="radio"
                    :value="theme.themeId"
                    v-model="wizardData.themeId"
                    class="sr-only"
                  />
                  <div
                    class="p-4 border rounded-lg text-center transition-all duration-200"
                    :class="{
                      'border-blue-500 bg-blue-50 text-blue-700':
                        wizardData.themeId === theme.themeId,
                      'border-gray-300 hover:border-gray-400': wizardData.themeId !== theme.themeId,
                    }"
                  >
                    <span class="font-medium">{{ theme.label }}</span>
                  </div>
                </label>
              </div>
            </div>
            <p class="text-sm text-gray-500">테마는 나중에 변경할 수 있습니다.</p>
          </div>

          <!-- 4단계: 친구 초대 -->
          <div class="w-full flex-shrink-0 space-y-6">
            <div class="text-center">
              <div class="mb-6">
                <div
                  class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"
                    />
                  </svg>
                </div>
                <h4 class="text-lg font-medium text-gray-900 mb-2">친구들과 함께 떠나요!</h4>
                <p class="text-sm text-gray-600">
                  초대 링크를 생성하여 친구들에게 공유하고<br />
                  함께 여행 계획을 세워보세요.
                </p>
              </div>

              <div class="space-y-4">
                <button
                  disabled
                  class="mx-auto px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                  title="준비 중인 기능입니다"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>초대 링크 생성</span>
                </button>

                <p class="text-xs text-gray-400">* 이 기능은 곧 출시될 예정입니다</p>
              </div>
            </div>

            <div class="text-center text-sm text-gray-500">
              <p>나중에도 플랜 설정에서 친구들을 초대할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 푸터 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <!-- 왼쪽: 다시 보지 않기 -->
          <button
            @click="neverShowAgain"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            다시 보지 않기
          </button>

          <!-- 오른쪽: 이전/다음/완료 버튼 -->
          <div class="flex items-center space-x-3">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              이전
            </button>
            <button
              v-if="currentStep < totalSteps"
              @click="nextStep"
              :disabled="!canProceed"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
            <button
              v-if="currentStep === totalSteps"
              @click="complete"
              class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
