<!--
여행지 검색 혹은 플랜 기능을 제공하는 페이지.

mode 설정 여부에 따라 검색 모드 혹은 플랜 모드로 동작.

검색 모드로 동작할 때는 단순히 시/도, 시/군/구를 기반으로,
혹은 키워드 기반으로 여행지를 검색하고 지도에서 해당 여행지의 위치를
조회하는 기능을 제공.

플랜 모드로 동작할 때는 검색 모드의 기능들과 더불어,
검색된 여행지를 플랜에 추가, 수정, 삭제하는 기능을 제공.
또한 현재 플랜의 인원 수, 테마 등을 선택하여 AI를 통해
여행지를 추천받을 수 있음.
-->

<script setup lang="ts">
import { useRoute, useRouter, type RouteRecordNameGeneric } from 'vue-router'
import KakaoMap from '@/components/map/KakaoMap.vue'
import AttractionInfoWindow from '@/components/map/AttractionInfoWindow.vue'
import EditableLabel from '@/components/EditableLabel.vue'
import PointList from '@/components/plan/PointList.vue'
import MockProfileIcon from '@/components/plan/MockProfileIcon.vue'
import PlanWizardModal from '@/components/plan/PlanWizardModal.vue'
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  computed,
  h,
  render,
  watch,
  onUpdated,
  nextTick,
} from 'vue'
import type { AttractionItem } from '@/types/tour'
import { useTourStore } from '@/stores/tourStore'
import { getAttractions } from '@/services/tourService'
import {
  mockAttractions,
  type ParticipantItem,
  type PlanItem,
  type PointItem,
  type VisibilityType,
} from '@/types/plan'
import NumberedMarker from '@/components/NumberedMarker.vue'
import {
  addPoint,
  deleteParticipant,
  deletePoint,
  getParticipants,
  getPlan,
  getPoints,
  updateNickname,
  updateParticipant,
  updatePlan,
  updatePoint,
} from '@/services/planService'
import { deserializeDate, getDateOnly, serializeDate } from '@/utils/date'
import { throttle } from 'throttle-debounce'
import { planThemes } from '@/constants/plan_themes'
import NullableDateInput from '@/components/NullableDateInput.vue'
import Select from 'primevue/select'
import Paginator from 'primevue/paginator'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const route = useRoute()
const router = useRouter()

// 모드
// TODO: Maybe find a better way to handle mode detection.
const mode = ref<'search' | 'plan'>(route.name === 'plan' ? 'plan' : 'search')
watch(
  () => route.name,
  (newName, oldName) => {
    if (newName === 'plan') {
      mode.value = 'plan'
    } else {
      mode.value = 'search'
    }
  },
)

const isMobile = ref(false)
const updateMobileMode = () => {
  isMobile.value = window.innerWidth < 1024
}

// 검색 키워드
const keyword = ref<string>('')

// 검색 결과를 저장할 상태
const searchResults = ref<AttractionItem[] | undefined>()

// 투어 스토어 사용
const tourStore = useTourStore()

const tourList = ref<AttractionItem[] | undefined>([])
const selectedSido = ref<string>('')
const selectedSigungu = ref<string>('')
const isTourLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const isSearchPanelHidden = ref(false)

// 선택된 여행지 상태
const selectedAttraction = ref<AttractionItem | null>(null)
// 마우스 호버된 여행지 상태
const hoveredAttraction = ref<AttractionItem | null>(null)
const attractionInfoContent = ref<string>('')

// 선택한 시도에 따른 시군구 목록 계산
const sigunguList = computed(() => {
  return tourStore.getSigunguListBySido(selectedSido.value)
})

// 포인트 리스트
const pointListRef = ref<HTMLDivElement | null>(null)

// 관광지 목록 조회
// TODO: 키워드 검색 구현
const fetchTourList = async () => {
  isTourLoading.value = true
  try {
    const response = await getAttractions({
      sidoCode: selectedSido.value,
      sigunguCode: selectedSigungu.value,
      page: currentPage.value,
      size: pageSize.value,
      keyword: keyword.value,
    })
    tourList.value = response.content
    totalCount.value = response.totalElements
  } catch (error) {
    console.error('관광지 목록 조회 실패:', error)
    tourList.value = undefined
    totalCount.value = 0
  } finally {
    isTourLoading.value = false

    // 검색 결과 업데이트
    handleAttractionFound(tourList.value)
  }
}

const handleSidoChange = () => {
  selectedSigungu.value = ''
  // 시도가 선택되면 해당 시도의 시군구 목록 조회
  tourStore.fetchSigunguList(selectedSido.value)
}

const handleSearch = () => {
  currentPage.value = 1 // 검색 시 첫 페이지로 이동
  fetchTourList()
}

// TODO: REMOVEME
const debugSearch = () => {
  tourList.value = mockAttractions
  totalCount.value = 10
  handleAttractionFound(tourList.value)
}

const handlePageChange = (event: any) => {
  // PrimeVue Paginator의 PageState는 first 속성을 0-based로 제공하므로 1-based로 변환
  currentPage.value = Math.floor(event.first / event.rows) + 1
  fetchTourList()
}

const handleRetry = () => {
  fetchTourList()
}

// 검색 결과를 처리하는 함수
const handleAttractionFound = (attractions: AttractionItem[] | undefined) => {
  searchResults.value = attractions
  console.log('검색 결과:', attractions)
}

// 카테고리별 아이콘 매핑 함수
const getCategoryIcon = (categoryCode: string | undefined): string => {
  switch (categoryCode) {
    case 'A01': // 자연
      return 'fa-tree'
    case 'A02': // 인문(문화/예술/역사)
      return 'fa-landmark'
    case 'A03': // 레포츠
      return 'fa-dumbbell'
    case 'A04': // 쇼핑
      return 'fa-shopping-bag'
    case 'A05': // 음식
      return 'fa-utensils'
    case 'B02': // 숙박
      return 'fa-bed'
    case 'C01': // 추천코스
      return 'fa-route'
    default:
      return 'fa-map-marker-alt' // 기본 위치 아이콘
  }
}

// 검색 패널 토글
const togglePanel = () => {
  isSearchPanelHidden.value = !isSearchPanelHidden.value
}

// 마커가 클릭되었을 때 호출되는 함수
const handleMarkerClick = (attraction: AttractionItem) => {
  selectedAttraction.value = attraction

  // 여행지 정보 콘텐츠 생성
  const div = document.createElement('div')
  const vnode = h(AttractionInfoWindow, { attraction })
  render(vnode, div)
  attractionInfoContent.value = div.innerHTML

  // 결과 목록에서도 해당 아이템 선택
  highlightResultItem(attraction)
}

// 결과 목록에서 아이템을 선택했을 때 호출되는 함수
const handleResultItemClick = (attraction: AttractionItem) => {
  selectedAttraction.value = attraction

  // 여행지 정보 콘텐츠 생성
  const div = document.createElement('div')
  const vnode = h(AttractionInfoWindow, { attraction })
  render(vnode, div)
  attractionInfoContent.value = div.innerHTML
}

// 결과 목록 아이템에 마우스가 올라갔을 때 호출되는 함수
const handleResultItemMouseEnter = (attraction: AttractionItem) => {
  hoveredAttraction.value = attraction
}

// 결과 목록 아이템에서 마우스가 떠났을 때 호출되는 함수
const handleResultItemMouseLeave = () => {
  hoveredAttraction.value = null
}

// 결과 목록에서 해당 아이템 하이라이트
const highlightResultItem = (attraction: AttractionItem) => {
  // 여기서 결과 목록 UI를 조작하여 해당 아이템을 하이라이트할 수 있습니다.
  // 현재는 간단한 구현으로 남겨둡니다.
}

//
// === 플랜 모드 관련 시작 ===
//

// const searchCardTarget = ref('#search-card-desktop')
const planId = ref<number | null>(null)

watch(
  () => route.params.planId,
  (newPlanId) => {
    if (newPlanId) {
      planId.value = Number(typeof newPlanId === 'string' ? newPlanId : newPlanId[0])
    } else {
      planId.value = null
    }
  },
  { immediate: true },
)

watch(
  planId,
  () => {
    nextTick(() => {
      if (planId.value === null || planId.value === undefined) {
        plan.value = null
        points.value = null
        participants.value = null
      } else {
        fetchPlan()
        fetchPoints()
        fetchParticipants()
      }
    })
  },
  { immediate: true },
)

const canSearchCardTeleport = ref(false)

const searchCardTarget = computed(() => {
  if (mode.value !== 'plan') {
    return '#search-card-desktop'
  }

  return isMobile.value ? '#search-card-mobile' : '#search-card-desktop'
})

// 마우스 호버된 포인트 상태
const hoveredPoint = ref<PointItem | null>(null)

const plan = ref<PlanItem | null>(null)
const points = ref<PointItem[] | null>(null)
const participants = ref<ParticipantItem[] | null>(null)

// 인원 수 변동은 디바운스되어 서버에 즉시 반영되지 않으므로,
// 임시로 값을 저장해놓고 나중에 한 번에 업데이트함
const cachedPeople = ref<number>(1)

// TODO: 사용자가 이 플랜의 주최자인지를 확인하는 로직 필요
// 사용자 정보에서 userId를 받아올 수 있게 되면 추후 수정
const tempUserId = ref(3)

// 마법사 모달 관련
const showWizardModal = ref(false)
const WIZARD_STORAGE_KEY = 'plan-wizard-never-show'

// 마법사 모달을 표시할지 확인
const shouldShowWizard = () => {
  // 새로 생성된 플랜인지 확인 (쿼리 파라미터)
  const isNewPlan = route.query.newPlan === 'true'

  // 새로 생성된 플랜이 아니면 마법사 표시하지 않음
  if (!isNewPlan) {
    return false
  }

  // '다시 보지 않기'를 선택했는지 확인
  const neverShow = localStorage.getItem(WIZARD_STORAGE_KEY)
  if (neverShow === 'true') {
    return false
  }

  // 플랜이 있으면 마법사 표시
  return plan.value !== null
}

// 마법사 완료 처리
const handleWizardComplete = async (data: {
  description: string
  people: number
  themeId: number
}) => {
  await _updatePlan({
    description: data.description,
    people: data.people,
    themeId: data.themeId,
  })
}

// 다시 보지 않기 처리
const handleWizardNeverShow = () => {
  localStorage.setItem(WIZARD_STORAGE_KEY, 'true')
}

// 테마 ID를 위한 computed 속성 - undefined를 null로 변환
const selectedThemeId = computed({
  get: () => plan.value?.themeId ?? null,
  set: (value) => {
    if (plan.value) {
      _updatePlan({ themeId: value === null ? undefined : value })
    }
  },
})

const fetchPlan = async () => {
  if (planId.value === null || planId.value === undefined) {
    return
  }

  const response = await getPlan(planId.value)
  plan.value = response

  cachedPeople.value = response.people || 1

  // 플랜 로드 후 마법사 표시 확인
  nextTick(() => {
    if (shouldShowWizard()) {
      showWizardModal.value = true

      // 쿼리 파라미터에서 newPlan 제거
      const currentQuery = { ...route.query }
      delete currentQuery.newPlan
      router.replace({ query: currentQuery })
    }
  })
}

const _updatePlan = async (
  params: {
    themeId?: number
    ownerId?: number
    ownerNickname?: string
    title?: string
    description?: string
    memo?: string
    people?: number
    visibility?: VisibilityType
    startDate?: Date
    endDate?: Date
  } = {},
) => {
  if (planId.value === null || planId.value === undefined) {
    return
  }
  await updatePlan(planId.value, params)

  // For now, let's just assume the updated value has been reflected server-side correctly.
  if (plan.value) {
    for (const key of Object.keys(params)) {
      const typedKey = key as keyof typeof params
      const value = params[typedKey]
      ;(plan.value as any)[key] = value
    }
  }
}

const throttledUpdatePeople = throttle(500, () => {
  _updatePlan({ people: cachedPeople.value })
})

const incrementPeople = () => {
  cachedPeople.value++
  throttledUpdatePeople()
}

const decrementPeople = () => {
  cachedPeople.value--
  _updatePlan({ people: cachedPeople.value })
}

const getDefaultStartDate = () => {
  const today = getDateOnly(new Date())
  if (plan.value?.endDate) {
    const endDate = getDateOnly(new Date(plan.value.endDate))
    if (today <= endDate) {
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 1)
      return startDate
    }
  }
  return today
}

const getDefaultEndDate = () => {
  if (plan.value?.startDate) {
    const endDate = new Date(plan.value.startDate)
    endDate.setDate(endDate.getDate() + 1)
    return endDate
  }
  return getDateOnly(new Date())
}

const fetchPoints = async () => {
  if (planId.value === null || planId.value === undefined) {
    return
  }
  const response = await getPoints(planId.value)
  points.value = response
}

const fetchParticipants = async () => {
  if (planId.value === null || planId.value === undefined) {
    return
  }
  const response = await getParticipants(planId.value)
  participants.value = response
}

const handleAddAttraction = async (attraction: AttractionItem) => {
  if (planId.value === null || planId.value === undefined) {
    return
  }

  let startDate: Date
  if (points.value && points.value.length !== 0) {
    startDate = new Date(points.value[points.value.length - 1].endDate)
    startDate.setMinutes(startDate.getMinutes() + 30)
  } else {
    startDate = new Date()
  }
  const endDate = new Date(startDate)
  endDate.setMinutes(endDate.getMinutes() + 30)

  const response = await addPoint(planId.value, {
    attractionId: attraction.attractionId,
    from: startDate,
    to: endDate,
  })

  const point = {
    pointId: response.pointId,
    startDate: deserializeDate(response.from),
    endDate: deserializeDate(response.to),
    attraction: attraction,
  } as PointItem

  if (points.value) {
    points.value.push(point)
  }

  // 포인트 리스트 맨 밑으로 스크롤
  nextTick(() => {
    pointListRef.value?.scrollTo({
      top: pointListRef.value?.scrollHeight,
      behavior: 'smooth',
    })
  })
}

const handleDeletePoint = async (point: PointItem) => {
  if (planId.value === null || planId.value === undefined) {
    return
  }

  await deletePoint(planId.value, point.pointId)

  if (points.value) {
    points.value = points.value.filter((p) => p.pointId !== point.pointId)
  }
}

const handleUpdatePoint = async (point: PointItem) => {
  if (planId.value === null || planId.value === undefined) {
    return
  }

  await updatePoint(planId.value, point.pointId, {
    from: point.startDate,
    to: point.endDate,
  })

  if (points.value) {
    points.value = points.value.map((p) => {
      if (p.pointId === point.pointId) {
        return point
      }
      return p
    })
  }
}

// 포인트 마우스 이벤트 핸들러
const handlePointMouseEnter = (point: PointItem) => {
  hoveredPoint.value = point
}

const handlePointMouseLeave = () => {
  hoveredPoint.value = null
}

const handlePointClick = (point: PointItem) => {
  selectedAttraction.value = point.attraction

  // 여행지 정보 콘텐츠 생성
  const div = document.createElement('div')
  const vnode = h(AttractionInfoWindow, { attraction: point.attraction })
  render(vnode, div)
  attractionInfoContent.value = div.innerHTML
}

const handleMapPointHover = (point: PointItem | null) => {
  hoveredPoint.value = point
}

const handlePointMarkerClick = (point: PointItem) => {
  selectedAttraction.value = point.attraction

  // 여행지 정보 콘텐츠 생성
  const div = document.createElement('div')
  const vnode = h(AttractionInfoWindow, { attraction: point.attraction })
  render(vnode, div)
  attractionInfoContent.value = div.innerHTML
}

// 참여자 권한 변경
const handleChangeParticipantRole = async (
  participant: ParticipantItem,
  newRole: 'owner' | 'member',
) => {
  if (planId.value === null || planId.value === undefined) {
    return
  }

  const { userId, role } = await updateParticipant(planId.value, participant.userId, {
    role: newRole,
  })

  if (participants.value) {
    participants.value = participants.value.map((p) => {
      if (p.userId === userId) {
        return { ...p, role }
      }
      return p
    })
  }
}

// 참여자 추방
const handleRemoveParticipant = async (participant: ParticipantItem) => {
  if (planId.value === null || planId.value === undefined) {
    return
  }

  if (!confirm(`${participant.nickname}님을 플랜에서 추방하시겠습니까?`)) {
    return
  }

  await deleteParticipant(planId.value, participant.userId)

  if (participants.value) {
    participants.value = participants.value.filter((p) => p.userId !== participant.userId)
  }
}

// 현재 사용자가 주최자인지 확인
const isCurrentUserHost = computed(() => {
  return plan.value?.ownerId === tempUserId.value
})

// 현재 사용자가 스태프인지 확인
const isCurrentUserStaff = computed(() => {
  return participants.value?.find((p) => p.userId === tempUserId.value)?.role === 'owner'
})

// 참여자가 스태프인지 확인 (role이 'owner'인 경우)
const isParticipantStaff = (participant: ParticipantItem) => {
  return participant.role === 'owner'
}

// 참여자 초대 (구현 예정)
const handleInviteParticipant = () => {
  alert('참여자 초대 기능은 구현 예정입니다.')
}

// 닉네임 편집 상태 관리
const editingNickname = ref<number | null>(null)
const editNicknameValue = ref('')

// 닉네임 편집 시작
const startEditNickname = (participant: ParticipantItem) => {
  editNicknameValue.value = participant.nickname
  editingNickname.value = participant.userId

  // 다음 틱에서 input에 포커스
  nextTick(() => {
    const input = document.querySelector('.nickname-edit-input') as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  })
}

// 닉네임 편집 취소
const cancelEditNickname = () => {
  editingNickname.value = null
  editNicknameValue.value = ''
}

// 닉네임 편집 저장
const saveEditNickname = async () => {
  if (planId.value === null || planId.value === undefined) {
    return
  }

  if (!editNicknameValue.value.trim()) {
    alert('닉네임을 입력해주세요.')
    return
  }

  const userId = editingNickname.value
  const newNickname = editNicknameValue.value.trim()

  const { nickname } = await updateNickname(planId.value, tempUserId.value, {
    nickname: newNickname,
  })

  // 임시로 로컬 상태 업데이트
  if (participants.value && userId) {
    participants.value = participants.value.map((p) => {
      if (p.userId === userId) {
        return { ...p, nickname }
      }
      return p
    })
  }

  cancelEditNickname()
}

const sortedParticipants = computed(() => {
  // 주최자, 스태프, 멤버 순으로 정렬, 일반 멤버 간에는 순서 상관 없음
  if (!participants.value) return []

  return [...participants.value].sort((a, b) => {
    const planOwnerId = plan.value?.ownerId
    if (planOwnerId === a.userId) return -1
    if (planOwnerId === b.userId) return 1
    if (a.role === 'owner' && b.role !== 'owner') return -1
    if (b.role === 'owner' && a.role !== 'owner') return 1
    return 0
  })
})

//
// === 플랜 모드 관련 끝 ===
//

onMounted(() => {
  // 컴포넌트 마운트 시 시도 목록 조회
  tourStore.fetchSidoList()

  updateMobileMode()
  window.addEventListener('resize', updateMobileMode)

  // DOM이 준비된 후에 teleport 가능하도록 설정
  nextTick(() => {
    canSearchCardTeleport.value = true
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMobileMode)
})
</script>

<template>
  <div class="search-plan-view-container pt-nav">
    <div class="plan-body-container">
      <aside v-if="mode === 'plan'" class="plan-left-panel shadow-xs">
        <span>plan side panel</span>
        <div ref="pointListRef" class="plan-left-panel-half-container">
          <span class="text-2xl">경로 결과</span>
          <point-list
            :points="points ?? []"
            :hovered-point="hoveredPoint"
            :editable="isCurrentUserHost || isCurrentUserStaff"
            @delete-point="handleDeletePoint"
            @update-point="handleUpdatePoint"
            @mouseenter="handlePointMouseEnter"
            @mouseleave="handlePointMouseLeave"
            @point-click="handlePointClick"
          />
        </div>
        <div
          id="search-card-mobile"
          class="plan-left-panel-half-container"
          :class="{ hidden: !isMobile }"
        >
          <span class="text-2xl">검색 결과</span>
        </div>
      </aside>
      <div class="search-view-container">
        <KakaoMap
          id="map"
          :attractions="searchResults"
          :selected-attraction-or-point="selectedAttraction"
          :hovered-attraction="hoveredAttraction"
          :attraction-info-content="attractionInfoContent"
          :points="points ?? []"
          :hovered-point="hoveredPoint"
          @marker-click="handleMarkerClick"
          @point-hover="handleMapPointHover"
          @point-marker-click="handlePointMarkerClick"
        />
        <div class="overlay-container" :class="{ 'panel-hidden': isSearchPanelHidden }">
          <button class="toggle-panel-btn" @click="togglePanel">
            <i :class="isSearchPanelHidden ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"></i>
          </button>
          <div
            v-show="!isMobile"
            id="search-card-desktop"
            class="search-card"
            :class="{ 'search-card-floating': mode !== 'search' }"
          ></div>
        </div>
      </div>
      <aside v-if="mode === 'plan'" class="plan-right-panel shadow-xs">
        <div v-if="plan" class="contents">
          <div class="flex flex-col m-8">
            <editable-label
              class="text-2xl max-w-128"
              mode="input"
              :label="plan?.title"
              :disabled="!isCurrentUserHost"
              placeholder="플랜 제목을 입력해주세요."
              @save="(s) => _updatePlan({ title: s })"
            />
            <editable-label
              class="text-sm max-w-128"
              mode="input"
              :label="plan?.description"
              :disabled="!isCurrentUserHost"
              placeholder="플랜 설명을 입력해주세요."
              @save="(s) => _updatePlan({ description: s })"
            />
            <editable-label
              class="text-sm max-w-128 min-h-32"
              mode="textarea"
              :label="plan?.memo"
              :disabled="!isCurrentUserHost"
              placeholder="플랜 메모를 입력해주세요."
              @save="(s) => _updatePlan({ memo: s })"
            />

            <!-- 마법사 재실행 버튼 -->
            <button
              v-if="isCurrentUserHost"
              @click="showWizardModal = true"
              class="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors self-start"
            >
              플랜 설정 마법사 실행
            </button>
          </div>
          <div class="flex flex-col m-8 mt-16">
            <!-- 인원수 카운터 -->
            <label class="block text-sm font-medium text-gray-700 mb-2">인원수</label>
            <div class="flex items-center space-x-3">
              <button
                :disabled="!isCurrentUserHost"
                @click="decrementPeople"
                class="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
              >
                -
              </button>
              <span class="min-w-[3rem] text-center text-lg font-medium">{{ cachedPeople }}</span>
              <button
                :disabled="!isCurrentUserHost"
                @click="incrementPeople"
                class="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
              >
                +
              </button>
            </div>
            <div class="flex items-center space-x-3">
              <label for="theme">테마</label>
              <select id="theme" v-model="selectedThemeId" :disabled="!isCurrentUserHost">
                <option
                  v-for="theme in planThemes"
                  :key="theme.themeId"
                  :value="theme.themeId"
                  :selected="plan.themeId === theme.themeId"
                >
                  {{ theme.label }}
                </option>
              </select>
            </div>

            <!-- 여행 날짜 선택 -->
            <div class="flex flex-col space-y-3 mt-4">
              <div class="flex flex-col space-y-2">
                <nullable-date-input
                  label="시작 날짜를 지정해주세요."
                  :model-value="plan.startDate"
                  :max-date="plan.endDate"
                  :disabled="!isCurrentUserHost"
                  @update:model-value="(date) => _updatePlan({ startDate: date })"
                  :default-date-generator="getDefaultStartDate"
                />
              </div>
              <div class="flex flex-col space-y-2">
                <nullable-date-input
                  label="종료 날짜를 지정해주세요."
                  :model-value="plan.endDate"
                  :min-date="plan.startDate"
                  :disabled="!isCurrentUserHost"
                  @update:model-value="(date) => _updatePlan({ endDate: date })"
                  :default-date-generator="getDefaultEndDate"
                />
              </div>
            </div>

            <!-- 참여자 -->
            <div class="mt-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800">참여자</h3>
                <button
                  v-if="isCurrentUserHost"
                  @click="handleInviteParticipant"
                  class="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200 shadow-sm hover:shadow-md"
                  title="참여자 초대"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div v-if="participants && participants.length > 0" class="space-y-3">
                <div
                  v-for="participant in sortedParticipants"
                  :key="participant.userId"
                  class="flex flex-col bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div class="flex items-center justify-between p-4">
                    <div class="flex items-center space-x-4">
                      <!-- 프로필 아이콘 -->
                      <mock-profile-icon :nickname="participant.nickname" :size="40" />

                      <div class="flex flex-col">
                        <!-- 닉네임과 주최자/스태프 아이콘 -->
                        <div class="flex items-center space-x-2 mb-1">
                          <span class="font-medium text-gray-900 text-base">{{
                            participant.nickname
                          }}</span>

                          <!-- 나 표시 -->
                          <span
                            v-if="participant.userId === tempUserId"
                            class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                          >
                            나
                          </span>

                          <!-- 닉네임 편집 버튼 (나일 경우만) -->
                          <button
                            v-if="participant.userId === tempUserId"
                            @click="startEditNickname(participant)"
                            class="flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="닉네임 편집"
                          >
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                              />
                            </svg>
                          </button>

                          <!-- 주최자 아이콘 -->
                          <div
                            v-if="plan && plan.ownerId === participant.userId"
                            class="flex flex-shrink-0 items-center justify-center w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-sm"
                            title="주최자"
                          >
                            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              />
                            </svg>
                          </div>

                          <!-- 스태프 아이콘 -->
                          <div
                            v-else-if="isParticipantStaff(participant)"
                            class="flex flex-shrink-0 items-center justify-center w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"
                            title="스태프"
                          >
                            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fill-rule="evenodd"
                                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>

                        <span class="text-sm text-gray-500 font-medium">
                          {{ participant.role === 'owner' ? '관리자' : '멤버' }}
                        </span>
                      </div>
                    </div>

                    <!-- 주최자만 볼 수 있는 권한 편집 및 추방 버튼 -->
                    <div v-if="isCurrentUserHost" class="flex items-center space-x-3">
                      <!-- 권한 편집 버튼 -->
                      <select
                        :value="participant.role"
                        @change="
                          handleChangeParticipantRole(
                            participant,
                            ($event.target as HTMLSelectElement).value as 'owner' | 'member',
                          )
                        "
                        class="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      >
                        <option value="owner">관리자</option>
                        <option value="member">멤버</option>
                      </select>

                      <!-- 추방 버튼 -->
                      <button
                        @click="handleRemoveParticipant(participant)"
                        class="flex items-center justify-center w-9 h-9 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                        title="추방"
                      >
                        <svg
                          class="w-4 h-4 group-hover:scale-110 transition-transform"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- 닉네임 편집 툴팁 -->
                  <div
                    v-if="editingNickname === participant.userId"
                    class="px-4 pb-4 border-t border-gray-100"
                  >
                    <div class="flex items-center space-x-2 pt-3">
                      <input
                        v-model="editNicknameValue"
                        type="text"
                        class="w-full nickname-edit-input flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        placeholder="새로운 닉네임을 입력하세요"
                        @keyup.enter="saveEditNickname"
                        @keyup.escape="cancelEditNickname"
                      />
                      <button
                        @click="saveEditNickname"
                        class="flex-shrink-0 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        저장
                      </button>
                      <button
                        @click="cancelEditNickname"
                        class="flex-shrink-0 px-3 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-col items-center justify-center py-8 text-gray-500">
                <svg class="w-12 h-12 text-gray-300 mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
                  />
                </svg>
                <span class="text-center">참여자가 없습니다.</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
  <Teleport v-if="canSearchCardTeleport" :to="searchCardTarget">
    <div class="flex flex-col h-full">
      <!-- 검색 옵션 영역 -->
      <div class="flex-shrink-0 bg-white p-6 shadow-sm">
        <!-- 지역 검색 섹션 -->
        <i class="fa-brands fa-user"></i>
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-primary-800 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd"
              />
            </svg>
            지역별 검색
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2 use-primary-as-secondary">
              <Select
                id="sido"
                v-model="selectedSido"
                :options="tourStore.sidoList"
                option-label="name"
                option-value="areaCode"
                placeholder="시/도"
                :disabled="isTourLoading || tourStore.isSidoLoading"
                @change="handleSidoChange"
                class="w-full select-custom"
                showClear
              />
            </div>
            <div class="space-y-2">
              <Select
                id="sigungu"
                v-model="selectedSigungu"
                :options="sigunguList"
                option-label="name"
                option-value="sigunguCode"
                placeholder="시/군/구"
                :disabled="isTourLoading || tourStore.isSigunguLoading || !selectedSido"
                class="w-full select-custom"
                showClear
              />
            </div>
          </div>
        </div>

        <!-- 키워드 검색 섹션 -->
        <div class="mb-2">
          <h3 class="text-lg font-semibold text-primary-800 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clip-rule="evenodd"
              />
            </svg>
            키워드 검색
          </h3>

          <div class="flex gap-3">
            <div class="flex-1">
              <input
                type="text"
                class="w-full py-3 px-4 text-sm bg-white border border-primary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 placeholder-primary-400"
                v-model="keyword"
                placeholder="여행지 이름을 입력해주세요."
              />
            </div>
            <button
              @click="handleSearch"
              :disabled="isTourLoading || (!selectedSido && !keyword)"
              class="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary-200 focus:outline-none min-w-[80px] flex items-center justify-center"
            >
              검색
            </button>
          </div>
        </div>
      </div>
      <!-- 검색 결과 표시 -->
      <div class="results-container flex-1 overflow-y-auto p-4 space-y-4">
        <!-- 검색 실패 상태 -->
        <div
          v-if="searchResults === null"
          class="flex flex-col items-center justify-center py-8 px-4"
        >
          <div class="bg-accent-50 border border-accent-200 rounded-lg p-6 text-center max-w-sm">
            <svg
              class="w-12 h-12 text-accent-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 class="text-lg font-semibold text-accent-800 mb-2">검색에 실패하였습니다</h3>
            <p class="text-accent-600 mb-4">다시 시도해주세요.</p>
            <button
              @click="handleRetry"
              class="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              재시도
            </button>
          </div>
        </div>
        <!-- 검색 실패 상태 -->
        <div
          v-if="searchResults === undefined"
          class="flex flex-col items-center justify-center py-8 px-4"
        >
          <div
            class="bg-secondary-50 border border-secondary-200 rounded-lg p-6 text-center max-w-sm"
          >
            <svg
              class="w-12 h-12 text-secondary-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 class="text-lg font-semibold text-secondary-800 mb-2"></h3>
            <p class="text-secondary-600">지역을 선택하고 검색해 보세요.</p>
          </div>
        </div>

        <!-- 검색 결과 없음 상태 -->
        <div
          v-else-if="searchResults.length === 0"
          class="flex flex-col items-center justify-center py-8 px-4"
        >
          <div
            class="bg-secondary-50 border border-secondary-200 rounded-lg p-6 text-center max-w-sm"
          >
            <svg
              class="w-12 h-12 text-secondary-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 class="text-lg font-semibold text-secondary-800 mb-2">검색 결과가 없어요.</h3>
            <p class="text-secondary-600">다른 지역이나 키워드로 검색해 보세요.</p>
          </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-else-if="isTourLoading" class="flex flex-col items-center justify-center py-8">
          <div class="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
            <svg
              class="w-8 h-8 text-primary-600 mx-auto mb-3 animate-spin"
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
            <p class="text-primary-700 font-medium">로딩 중...</p>
          </div>
        </div>

        <!-- 검색 결과 목록 -->
        <div v-else class="bg-white rounded-lg overflow-hidden divide-y divide-secondary-200">
          <div
            v-for="item in searchResults"
            :key="item.contentId"
            class="hover:bg-secondary-100 transition-all duration-200 cursor-pointer group"
            :class="{
              'bg-primary-100':
                selectedAttraction && selectedAttraction.contentId === item.contentId,
            }"
            @click="handleResultItemClick(item)"
            @mouseenter="handleResultItemMouseEnter(item)"
            @mouseleave="handleResultItemMouseLeave"
          >
            <div class="flex items-center p-4">
              <!-- 이미지 영역 -->
              <div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-secondary-100 mr-4">
                <img
                  v-if="item.firstImageUrl"
                  :src="item.firstImageUrl"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-secondary-400"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              <!-- 정보 영역 -->
              <div class="flex-1 min-w-0">
                <h3
                  class="text-base font-semibold text-primary-800 truncate group-hover:text-primary-900 transition-colors flex items-center"
                >
                  <font-awesome-icon
                    :icon="getCategoryIcon(item.category1)"
                    class="w-4 h-4 mr-2 text-primary-600 flex-shrink-0"
                  />
                  {{ item.title }}
                </h3>
                <p class="text-sm text-secondary-700 mt-1 line-clamp-2">
                  {{ item.address1 }} {{ item.address2 }}
                </p>
                <p v-if="item.telephone" class="text-xs text-secondary-500 mt-1">
                  {{ item.telephone }}
                </p>
              </div>

              <!-- 추가 버튼 -->
              <div v-if="isCurrentUserHost || isCurrentUserStaff" class="flex-shrink-0 ml-3">
                <button
                  @click.stop="handleAddAttraction(item)"
                  class="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 페이지네이션 -->
      <div class="flex-shrink-0">
        <Paginator
          v-if="searchResults && searchResults.length > 0"
          :first="(currentPage - 1) * pageSize"
          :rows="pageSize"
          :totalRecords="totalCount"
          @page="handlePageChange"
        />
      </div>
    </div>
  </Teleport>

  <!-- 플랜 마법사 모달 -->
  <PlanWizardModal
    v-model="showWizardModal"
    :initial-description="plan?.description"
    :initial-people="plan?.people"
    :initial-theme-id="plan?.themeId"
    @complete="handleWizardComplete"
    @never-show-again="handleWizardNeverShow"
  />
</template>

<style scoped>
:root {
  --left-side-panel-width: 400px;
  --right-side-panel-width: 400px;
  --search-panel-width: 240px;
}

.search-plan-view-container {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.plan-top-panel {
  width: 100%;
  height: 320px;
}

.plan-body-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.plan-left-panel {
  width: var(--left-side-panel-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  z-index: 20;
  transition: transform 0.3s ease;
}

.plan-left-panel-half-container {
  width: 100%;
  flex-basis: 0;
  flex-grow: 1;
  overflow-y: auto;
}

.plan-right-panel {
  width: var(--right-side-panel-width);
  height: 100%;
  background-color: #f0f0f0;
  z-index: 20;
}

.search-view-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 400px;
  pointer-events: none;
  z-index: 10;
  transition: transform 0.3s ease;
}

.overlay-container.panel-hidden {
  transform: translateX(-100%);
}

.toggle-panel-btn {
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 0 4px 4px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 11;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.overlay-container > * {
  pointer-events: auto;
}

.search-card {
  --search-card-margin: 0rem;
  width: calc(100%-var(--search-card-margin));
  height: calc(100% - 2 * var(--search-card-margin));
  margin: var(--search-card-margin) 0rem var(--search-card-margin) var(--search-card-margin);
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition:
    width 0.3s ease,
    height 0.3s ease,
    margin 0.3s ease,
    border-radius 0.3s ease;
}

.search-card.search-card-floating {
  --search-card-margin: 0.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

#map {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #666;
}
</style>
