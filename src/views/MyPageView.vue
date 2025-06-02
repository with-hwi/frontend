<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
import MockProfileIcon from '@/components/plan/MockProfileIcon.vue'
import EditableLabel from '@/components/EditableLabel.vue'

const userStore = useUserStore()

// 사용자 프로필 정보
const userProfile = ref<UserProfile | null>(null)

// 탭 관리
const activeTab = ref<'plans' | 'joins' | 'likes'>('plans')

// 데이터
const myPlans = ref<MyPlan[]>([])
const myJoins = ref<MyJoin[]>([])
const myLikes = ref<MyLike[]>([])

// 로딩 상태
const isLoading = ref(true)

// 탭별 데이터 계산
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

// 탭 설정
const tabs = [
  { key: 'plans', label: '내가 만든 플랜', count: computed(() => myPlans.value.length) },
  { key: 'joins', label: '참여한 플랜', count: computed(() => myJoins.value.length) },
  { key: 'likes', label: '좋아요한 플랜', count: computed(() => myLikes.value.length) },
]

// 데이터 로드
const loadData = async () => {
  try {
    isLoading.value = true
    const [profile, plans, joins, likes] = await Promise.all([
      getUserProfile(),
      getMyPlans(),
      getMyJoins(),
      getMyLikes(),
    ])

    userProfile.value = profile
    myPlans.value = plans
    myJoins.value = joins
    myLikes.value = likes
  } catch (error) {
    console.error('마이페이지 데이터 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
}

// 개별 필드 저장 함수들
const saveNickname = async (newNickname: string) => {
  try {
    const updatedProfile = await editUserProfile({ nickname: newNickname })
    // userProfile.value = updatedProfile
    // userStore의 닉네임도 업데이트
    // 임시로, 저장 후에 값을 직접 업데이트
    if (userProfile.value) {
      userProfile.value.nickname = newNickname
    }
    if (userStore.userInfo) {
      userStore.setUserInfo({
        ...userStore.userInfo,
        nickname: newNickname,
      })
    }
  } catch (error) {
    console.error('닉네임 업데이트 실패:', error)
  }
}

const saveAge = async (newAge: string) => {
  try {
    // "25세"에서 숫자만 추출
    const ageMatch = newAge.match(/\d+/)
    if (!ageMatch) {
      return
    }
    const age = parseInt(ageMatch[0])
    if (isNaN(age) || age <= 0 || age > 120) {
      return
    }
    const updatedProfile = await editUserProfile({ age })
    // userProfile.value = updatedProfile
    if (userProfile.value) {
      userProfile.value.age = age
    }
  } catch (error) {
    console.error('나이 업데이트 실패:', error)
  }
}

const saveSex = async (newSex: 'M' | 'W' | '') => {
  try {
    const sex = newSex === '' ? undefined : (newSex as 'M' | 'W')
    const updatedProfile = await editUserProfile({ sex })
    // userProfile.value = updatedProfile
    // 임시로, 저장 후에 값을 직접 업데이트
    if (userProfile.value) {
      userProfile.value.sex = sex
    }
  } catch (error) {
    console.error('성별 업데이트 실패:', error)
  }
}

// 플랜 카드 클릭 처리
const goToPlanDetail = (planId: number) => {
  // 플랜 상세 페이지로 이동
  window.open(`/plan/${planId}`, '_blank')
}

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="min-h-screen bg-secondary-50 pt-nav">
    <!-- 헤더 영역 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <!-- 프로필 아이콘 -->
            <MockProfileIcon
              :nickname="userStore.userInfo?.nickname || '사용자'"
              :size="80"
              class="ring-4 ring-primary-100"
            />

            <!-- 사용자 정보 -->
            <div v-if="!isLoading" class="space-y-1">
              <!-- 닉네임 -->
              <div>
                <h1 class="text-xl font-bold text-primary-900 mb-1">
                  <span v-if="userProfile?.nickname">{{ userProfile.nickname }}</span>
                  <EditableLabel
                    v-else
                    :label="userProfile?.nickname || '사용자'"
                    placeholder="닉네임을 입력하세요"
                    mode="input"
                    @save="saveNickname"
                  />
                </h1>
              </div>

              <!-- 나이 -->
              <div class="flex items-center space-x-2">
                <span class="text-secondary-700 font-medium">나이:</span>
                <EditableLabel
                  :label="userProfile?.age ? `${userProfile.age}세` : '미설정'"
                  placeholder="나이를 입력하세요"
                  mode="input"
                  variant="small"
                  @save="saveAge"
                />
              </div>

              <!-- 성별 -->
              <div class="flex items-center space-x-2">
                <span class="text-secondary-700 font-medium">성별:</span>
                <div class="flex space-x-2">
                  <button
                    @click="saveSex('M')"
                    class="px-3 py-1 rounded-md text-sm transition-colors duration-200"
                    :class="{
                      'bg-primary-100 text-primary-700 border border-primary-300':
                        userProfile?.sex === 'M',
                      'bg-secondary-100 text-secondary-700 border border-secondary-300 hover:bg-secondary-200':
                        userProfile?.sex !== 'M',
                    }"
                  >
                    남성
                  </button>
                  <button
                    @click="saveSex('W')"
                    class="px-3 py-1 rounded-md text-sm transition-colors duration-200"
                    :class="{
                      'bg-primary-100 text-primary-700 border border-primary-300':
                        userProfile?.sex === 'W',
                      'bg-secondary-100 text-secondary-700 border border-secondary-300 hover:bg-secondary-200':
                        userProfile?.sex !== 'W',
                    }"
                  >
                    여성
                  </button>
                  <button
                    @click="saveSex('')"
                    class="px-3 py-1 rounded-md text-sm transition-colors duration-200"
                    :class="{
                      'bg-primary-100 text-primary-700 border border-primary-300':
                        !userProfile?.sex,
                      'bg-secondary-100 text-secondary-700 border border-secondary-300 hover:bg-secondary-200':
                        userProfile?.sex,
                    }"
                  >
                    미설정
                  </button>
                </div>
              </div>
            </div>

            <!-- 로딩 스켈레톤 -->
            <div v-else class="space-y-3">
              <div class="h-8 bg-secondary-200 rounded animate-pulse w-48"></div>
              <div class="h-4 bg-secondary-200 rounded animate-pulse w-32"></div>
              <div class="h-4 bg-secondary-200 rounded animate-pulse w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 탭 및 콘텐츠 영역 -->
    <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- 탭 네비게이션 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="border-b border-secondary-200">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key as 'plans' | 'joins' | 'likes'"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
              :class="{
                'border-primary-500 text-primary-600': activeTab === tab.key,
                'border-transparent text-secondary-700 hover:text-secondary-900 hover:border-secondary-300':
                  activeTab !== tab.key,
              }"
            >
              {{ tab.label }}
              <span
                class="ml-2 py-0.5 px-2 rounded-full text-xs font-medium"
                :class="{
                  'bg-primary-100 text-primary-600': activeTab === tab.key,
                  'bg-secondary-100 text-secondary-600': activeTab !== tab.key,
                }"
              >
                {{ tab.count.value }}
              </span>
            </button>
          </nav>
        </div>

        <!-- 탭 콘텐츠 -->
        <div class="p-6">
          <!-- 로딩 상태 -->
          <div v-if="isLoading" class="space-y-4">
            <div
              v-for="i in 3"
              :key="i"
              class="h-32 bg-secondary-100 rounded-lg animate-pulse"
            ></div>
          </div>

          <!-- 플랜 목록 -->
          <div v-else-if="currentTabData.length > 0" class="space-y-4">
            <div
              v-for="plan in currentTabData"
              :key="plan.planId"
              @click="goToPlanDetail(plan.planId)"
              class="bg-secondary-50 rounded-lg p-6 border border-secondary-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-primary-900 mb-2">
                    {{ plan.title }}
                  </h3>
                  <p class="text-secondary-700 mb-3 line-clamp-2">
                    {{ plan.description || '설명이 없습니다.' }}
                  </p>
                  <div class="flex items-center space-x-4 text-sm text-secondary-600">
                    <span class="flex items-center">
                      <svg
                        class="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {{ formatDate(plan.startDate) }} - {{ formatDate(plan.endDate) }}
                    </span>
                    <span class="flex items-center">
                      <svg
                        class="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {{ plan.people }}명
                    </span>
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      :class="{
                        'bg-primary-100 text-primary-600': plan.visibility === 'open',
                        'bg-secondary-100 text-secondary-600': plan.visibility === 'hidden',
                      }"
                    >
                      {{ plan.visibility === 'open' ? '공개' : '비공개' }}
                    </span>
                  </div>
                </div>
                <div class="ml-4 text-xs text-secondary-500">
                  {{ formatDate(plan.createdAt) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 빈 상태 -->
          <div v-else class="text-center py-12">
            <svg
              class="mx-auto h-12 w-12 text-secondary-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 class="text-sm font-medium text-secondary-900 mb-1">
              {{
                activeTab === 'plans'
                  ? '아직 만든 플랜이 없습니다'
                  : activeTab === 'joins'
                    ? '참여한 플랜이 없습니다'
                    : '좋아요한 플랜이 없습니다'
              }}
            </h3>
            <p class="text-sm text-secondary-600">
              {{
                activeTab === 'plans'
                  ? '새로운 여행 플랜을 만들어보세요!'
                  : activeTab === 'joins'
                    ? '다른 사람들의 플랜에 참여해보세요!'
                    : '마음에 드는 플랜에 좋아요를 눌러보세요!'
              }}
            </p>
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
