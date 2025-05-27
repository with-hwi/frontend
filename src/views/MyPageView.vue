<!--
마이페이지
사용자 프로필 정보와 플랜 목록을 관리할 수 있는 페이지
-->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  getUserProfile,
  editUserProfile,
  getMyPlans,
  getMyJoins,
  getMyLikes,
} from '@/services/userService'
import type { UserProfile, MyPlan, MyJoin, MyLike } from '@/types/user'
import type { EditUserProfileDto } from '@/types/dto/user'
import { useUserStore } from '@/stores/userStore'
import { usePlanModalStore } from '@/stores/planModalStore'
import { planThemes } from '@/constants/plan_themes'
import MockProfileIcon from '@/components/plan/MockProfileIcon.vue'

const router = useRouter()
const userStore = useUserStore()
const planModalStore = usePlanModalStore()

// 상태 관리
const profile = ref<UserProfile | null>(null)
const myPlans = ref<MyPlan[]>([])
const myJoins = ref<MyJoin[]>([])
const myLikes = ref<MyLike[]>([])

const isLoading = ref(true)
const isEditingProfile = ref(false)
const activeTab = ref<'plans' | 'joins' | 'likes'>('plans')

// 프로필 편집 폼 데이터
const profileForm = ref<EditUserProfileDto>({
  nickname: '',
  age: undefined,
  sex: undefined,
})

// 데이터 로딩
const loadProfile = async () => {
  try {
    profile.value = await getUserProfile()
    profileForm.value = {
      nickname: profile.value.nickname,
      age: profile.value.age,
      sex: profile.value.sex,
    }
  } catch (error) {
    console.error('프로필 로딩 실패:', error)
  }
}

const loadMyPlans = async () => {
  try {
    myPlans.value = await getMyPlans()
  } catch (error) {
    console.error('내 플랜 로딩 실패:', error)
  }
}

const loadMyJoins = async () => {
  try {
    myJoins.value = await getMyJoins()
  } catch (error) {
    console.error('참여한 플랜 로딩 실패:', error)
  }
}

const loadMyLikes = async () => {
  try {
    myLikes.value = await getMyLikes()
  } catch (error) {
    console.error('좋아요한 플랜 로딩 실패:', error)
  }
}

const loadAllData = async () => {
  isLoading.value = true
  try {
    await Promise.all([loadProfile(), loadMyPlans(), loadMyJoins(), loadMyLikes()])
  } finally {
    isLoading.value = false
  }
}

// 프로필 편집
const startEditProfile = () => {
  isEditingProfile.value = true
}

const cancelEditProfile = () => {
  isEditingProfile.value = false
  if (profile.value) {
    profileForm.value = {
      nickname: profile.value.nickname,
      age: profile.value.age,
      sex: profile.value.sex,
    }
  }
}

const saveProfile = async () => {
  try {
    const updatedProfile = await editUserProfile(profileForm.value)
    profile.value = updatedProfile

    // 사용자 스토어의 닉네임도 업데이트
    if (userStore.userInfo && profileForm.value.nickname) {
      userStore.setUserInfo({
        ...userStore.userInfo,
        nickname: profileForm.value.nickname,
      })
    }

    isEditingProfile.value = false
  } catch (error) {
    console.error('프로필 저장 실패:', error)
    alert('프로필 저장에 실패했습니다. 다시 시도해주세요.')
  }
}

// 탭별 데이터
const currentTabData = computed(() => {
  switch (activeTab.value) {
    case 'plans':
      return myPlans.value
    case 'joins':
      return myJoins.value
    case 'likes':
      return myLikes.value
    default:
      return []
  }
})

const currentTabTitle = computed(() => {
  switch (activeTab.value) {
    case 'plans':
      return '내가 만든 플랜'
    case 'joins':
      return '참여한 플랜'
    case 'likes':
      return '좋아요한 플랜'
    default:
      return ''
  }
})

// 테마 이름 조회
const getThemeName = (themeId?: number) => {
  const theme = planThemes.find((t) => t.themeId === themeId)
  return theme?.label || '테마 없음'
}

// 플랜 클릭 핸들러
const goToPlan = (planId: number) => {
  router.push(`/plan/${planId}`)
}

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  loadAllData()
})
</script>

<template>
  <div class="my-page-container pt-nav min-h-screen bg-secondary-50">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <svg
            class="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <p class="text-primary-700 font-medium">마이페이지를 불러오고 있어요...</p>
        </div>
      </div>

      <!-- 메인 콘텐츠 -->
      <div v-else class="space-y-8">
        <!-- 헤더 -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-primary-900 mb-2">마이페이지</h1>
          <p class="text-secondary-600">프로필과 플랜을 관리해보세요</p>
        </div>

        <!-- 프로필 카드 -->
        <div class="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div
            class="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-8 border-b border-primary-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-6">
                <!-- 프로필 아이콘 -->
                <mock-profile-icon
                  :nickname="profile?.nickname || ''"
                  :size="80"
                  class="border-4 border-white shadow-lg"
                />

                <!-- 프로필 정보 -->
                <div v-if="!isEditingProfile" class="space-y-2">
                  <h2 class="text-2xl font-bold text-primary-900">{{ profile?.nickname }}</h2>
                  <div class="flex items-center space-x-4 text-primary-700">
                    <span v-if="profile?.age" class="flex items-center">
                      <font-awesome-icon :icon="['fas', 'cake-candles']" class="mr-2" />
                      {{ profile.age }}세
                    </span>
                    <span v-if="profile?.sex" class="flex items-center">
                      <font-awesome-icon
                        :icon="['fas', profile.sex === 'M' ? 'mars' : 'venus']"
                        class="mr-2"
                      />
                      {{ profile.sex === 'M' ? '남성' : '여성' }}
                    </span>
                  </div>
                </div>

                <!-- 프로필 편집 폼 -->
                <div v-else class="space-y-4">
                  <div>
                    <input
                      v-model="profileForm.nickname"
                      type="text"
                      placeholder="닉네임"
                      class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div class="flex space-x-4">
                    <input
                      v-model.number="profileForm.age"
                      type="number"
                      placeholder="나이"
                      min="1"
                      max="120"
                      class="flex-1 px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                    <select
                      v-model="profileForm.sex"
                      class="flex-1 px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">성별 선택</option>
                      <option value="M">남성</option>
                      <option value="W">여성</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 프로필 편집 버튼들 -->
              <div class="flex items-center space-x-2">
                <button
                  v-if="!isEditingProfile"
                  @click="startEditProfile"
                  class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <font-awesome-icon :icon="['fas', 'edit']" class="mr-2" />
                  편집
                </button>
                <template v-else>
                  <button
                    @click="saveProfile"
                    class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <font-awesome-icon :icon="['fas', 'check']" class="mr-2" />
                    저장
                  </button>
                  <button
                    @click="cancelEditProfile"
                    class="px-4 py-2 bg-secondary-400 hover:bg-secondary-500 text-white rounded-lg transition-colors flex items-center"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
                    취소
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- 통계 정보 -->
          <div class="px-6 py-4">
            <div class="grid grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-primary-600">{{ myPlans.length }}</div>
                <div class="text-sm text-secondary-600">만든 플랜</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-accent-600">{{ myJoins.length }}</div>
                <div class="text-sm text-secondary-600">참여한 플랜</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-secondary-600">{{ myLikes.length }}</div>
                <div class="text-sm text-secondary-600">좋아요한 플랜</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 플랜 목록 섹션 -->
        <div class="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <!-- 탭 헤더 -->
          <div class="border-b border-secondary-200">
            <nav class="flex space-x-8 px-6" aria-label="Tabs">
              <button
                v-for="tab in [
                  { key: 'plans', label: '내가 만든 플랜', count: myPlans.length },
                  { key: 'joins', label: '참여한 플랜', count: myJoins.length },
                  { key: 'likes', label: '좋아요한 플랜', count: myLikes.length },
                ]"
                :key="tab.key"
                @click="activeTab = tab.key as 'plans' | 'joins' | 'likes'"
                :class="[
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                ]"
              >
                {{ tab.label }}
                <span
                  :class="[
                    activeTab === tab.key
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-secondary-100 text-secondary-600',
                    'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium transition-colors',
                  ]"
                >
                  {{ tab.count }}
                </span>
              </button>
            </nav>
          </div>

          <!-- 플랜 목록 -->
          <div class="p-6">
            <h3 class="text-lg font-semibold text-primary-800 mb-4">{{ currentTabTitle }}</h3>

            <!-- 빈 상태 -->
            <div v-if="currentTabData.length === 0" class="text-center py-12">
              <div
                class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8 text-secondary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h4 class="text-lg font-medium text-secondary-700 mb-2">
                {{
                  activeTab === 'plans'
                    ? '아직 만든 플랜이 없어요'
                    : activeTab === 'joins'
                      ? '아직 참여한 플랜이 없어요'
                      : '아직 좋아요한 플랜이 없어요'
                }}
              </h4>
              <p class="text-secondary-500">
                {{
                  activeTab === 'plans'
                    ? '첫 번째 여행 플랜을 만들어보세요!'
                    : activeTab === 'joins'
                      ? '다른 사람의 플랜에 참여해보세요!'
                      : '마음에 드는 플랜에 좋아요를 눌러보세요!'
                }}
              </p>
              <button
                v-if="activeTab === 'plans'"
                @click="planModalStore.openCreatePlanModal"
                class="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                플랜 만들기
              </button>
            </div>

            <!-- 플랜 카드 목록 -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="plan in currentTabData"
                :key="plan.planId"
                @click="goToPlan(plan.planId)"
                class="bg-white border border-secondary-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div class="p-6">
                  <!-- 플랜 헤더 -->
                  <div class="flex items-start justify-between mb-3">
                    <h4
                      class="text-lg font-semibold text-primary-800 group-hover:text-primary-600 transition-colors line-clamp-2"
                    >
                      {{ plan.title }}
                    </h4>
                    <div class="flex-shrink-0 ml-2">
                      <span
                        :class="[
                          plan.themeId
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-secondary-100 text-secondary-600',
                          'px-2 py-1 text-xs font-medium rounded-full',
                        ]"
                      >
                        {{ getThemeName(plan.themeId) }}
                      </span>
                    </div>
                  </div>

                  <!-- 플랜 설명 -->
                  <p v-if="plan.description" class="text-secondary-600 text-sm mb-4 line-clamp-2">
                    {{ plan.description }}
                  </p>

                  <!-- 플랜 정보 -->
                  <div class="space-y-2">
                    <div class="flex items-center text-sm text-secondary-600">
                      <font-awesome-icon :icon="['fas', 'users']" class="mr-2 w-4" />
                      {{ plan.people }}명
                    </div>
                    <div
                      v-if="plan.startDate && plan.endDate"
                      class="flex items-center text-sm text-secondary-600"
                    >
                      <font-awesome-icon :icon="['fas', 'calendar']" class="mr-2 w-4" />
                      {{ formatDate(plan.startDate) }} - {{ formatDate(plan.endDate) }}
                    </div>
                    <div class="flex items-center text-sm text-secondary-600">
                      <font-awesome-icon :icon="['fas', 'clock']" class="mr-2 w-4" />
                      {{ formatDate(plan.createdAt) }} 생성
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
