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
  type InviteCodeItem,
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
  createInviteCode,
} from '@/services/planService'
import { deserializeDate, getDateOnly, serializeDate } from '@/utils/date'
import { throttle } from 'throttle-debounce'
import { planThemes } from '@/constants/plan_themes'
import NullableDateInput from '@/components/NullableDateInput.vue'
import Select from 'primevue/select'
import Paginator from 'primevue/paginator'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Popover from 'primevue/popover'
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
  if (!isSearchEnabled.value) {
    return
  }

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

// 검색 가능 조건 충족 여부
const isSearchEnabled = computed(() => {
  return !(isTourLoading.value || (!selectedSido.value && !keyword.value))
})

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
const tempUserId = ref(1)

// 플랜 정보 섹션들의 접힘/펼침 상태
const isPlanBasicInfoExpanded = ref(true)
const isPlanCustomInfoExpanded = ref(true)
const isParticipantsExpanded = ref(true)

// 섹션 토글 함수들
const togglePlanBasicInfo = () => {
  isPlanBasicInfoExpanded.value = !isPlanBasicInfoExpanded.value
}

const togglePlanCustomInfo = () => {
  isPlanCustomInfoExpanded.value = !isPlanCustomInfoExpanded.value
}

const toggleParticipants = () => {
  isParticipantsExpanded.value = !isParticipantsExpanded.value
}

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

// 초대 링크 관련 상태
const inviteCode = ref<InviteCodeItem | null>(null)
const isCreatingInviteCode = ref(false)
const invitePopover = ref()

// 초대 링크 URL computed
const inviteUrl = computed(() => {
  if (!inviteCode.value) return ''
  return `${window.location.origin}/invite/${inviteCode.value.inviteCode}`
})

// 초대 링크 Popover 토글
const toggleInvitePopover = (event: Event) => {
  invitePopover.value?.toggle(event)
}

// 참여자 초대 버튼 클릭 (Popover 먼저 열기)
const handleInviteParticipant = (event: Event) => {
  // 먼저 Popover를 연다
  toggleInvitePopover(event)
  // 초대 코드 초기화
  inviteCode.value = null
}

// 초대 링크 생성
const generateInviteLink = async () => {
  if (planId.value === null || planId.value === undefined) {
    return
  }

  try {
    isCreatingInviteCode.value = true
    inviteCode.value = await createInviteCode(planId.value)
  } catch (error) {
    console.error('초대 링크 생성 실패:', error)
    alert('초대 링크 생성에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isCreatingInviteCode.value = false
  }
}

// 초대 링크 복사
const copyInviteLink = async () => {
  if (!inviteUrl.value) return

  try {
    await navigator.clipboard.writeText(inviteUrl.value)
    // alert('초대 링크가 클립보드에 복사되었습니다!')
  } catch (error) {
    console.error('클립보드 복사 실패:', error)
    // 클립보드 API가 지원되지 않는 경우 fallback
    const textArea = document.createElement('textarea')
    textArea.value = inviteUrl.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('초대 링크가 클립보드에 복사되었습니다!')
  }
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
      <aside v-if="mode === 'plan'" class="plan-left-panel bg-white border-r border-secondary-200">
        <div class="flex flex-col h-full">
          <!-- 헤더 -->
          <div
            class="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-primary-800">여행 경로</h2>
            </div>
          </div>

          <!-- 경로 목록 컨테이너 -->
          <div ref="pointListRef" class="flex-1 overflow-y-auto px-4 py-4">
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

            <!-- 빈 상태 표시 -->
            <div
              v-if="!points || points.length === 0"
              class="flex flex-col items-center justify-center py-12 px-4"
            >
              <div
                class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4"
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-secondary-700 mb-2">아직 경로가 없어요</h3>
              <p class="text-secondary-500 text-center">
                검색에서 여행지를 선택하여<br />나만의 여행 경로를 만들어보세요!
              </p>
            </div>
          </div>

          <!-- 모바일 검색 카드 영역 -->
          <div
            id="search-card-mobile"
            class="flex-1 border-t border-secondary-200"
            :class="{ hidden: !isMobile }"
          >
            <div
              class="px-6 py-4 bg-gradient-to-r from-accent-50 to-accent-100 border-b border-accent-200"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <h2 class="text-xl font-bold text-accent-800">검색 결과</h2>
              </div>
            </div>
          </div>
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
          <button
            class="toggle-panel-btn text-primary-500 hover:text-primary-600"
            @click="togglePanel"
          >
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

      <!-- 플랜 정보 영역 -->
      <aside v-if="mode === 'plan'" class="plan-right-panel">
        <div v-if="plan" class="contents min-h-full bg-transparent pointer-events-auto">
          <!-- 플랜 기본 정보 영역 -->
          <div class="pt-4 pr-4">
            <div
              class="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-secondary-200 p-6"
            >
              <div
                class="flex items-center justify-between mb-4 cursor-pointer select-none hover:bg-secondary-50 -mx-2 px-2 py-2 rounded-lg transition-colors duration-200"
                @click="togglePlanBasicInfo"
              >
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3"
                  >
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-primary-800">플랜 기본 정보</h3>
                </div>
                <div
                  class="transition-transform duration-200"
                  :class="{ 'rotate-180': !isPlanBasicInfoExpanded }"
                >
                  <svg class="w-5 h-5 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div v-show="isPlanBasicInfoExpanded" class="space-y-4 transition-all duration-300">
                <editable-label
                  class="text-xl max-w-full"
                  mode="input"
                  :label="plan?.title"
                  :disabled="!isCurrentUserHost"
                  placeholder="플랜 제목을 입력해주세요."
                  @save="(s) => _updatePlan({ title: s })"
                />
                <editable-label
                  class="text-sm max-w-full"
                  mode="input"
                  :label="plan?.description"
                  :disabled="!isCurrentUserHost"
                  placeholder="플랜 설명을 입력해주세요."
                  @save="(s) => _updatePlan({ description: s })"
                />
                <editable-label
                  class="text-sm max-w-full min-h-32"
                  mode="textarea"
                  :label="plan?.memo"
                  :disabled="!isCurrentUserHost"
                  placeholder="플랜 메모를 입력해주세요."
                  @save="(s) => _updatePlan({ memo: s })"
                />
              </div>
            </div>
          </div>

          <!-- 플랜 맞춤 정보 영역 -->
          <div class="pt-4 pr-4">
            <div
              class="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-secondary-200 p-6"
            >
              <div
                class="flex items-center justify-between mb-4 cursor-pointer select-none hover:bg-secondary-50 -mx-2 px-2 py-2 rounded-lg transition-colors duration-200"
                @click="togglePlanCustomInfo"
              >
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center mr-3"
                  >
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-primary-800">플랜 맞춤 정보</h3>
                </div>
                <div
                  class="transition-transform duration-200"
                  :class="{ 'rotate-180': !isPlanCustomInfoExpanded }"
                >
                  <svg class="w-5 h-5 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div v-show="isPlanCustomInfoExpanded" class="space-y-6 transition-all duration-300">
                <!-- 인원수 -->
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-primary-800">인원수</label>
                  <div class="w-40">
                    <InputNumber
                      v-model="cachedPeople"
                      :disabled="!isCurrentUserHost"
                      :min="1"
                      :max="20"
                      showButtons
                      buttonLayout="horizontal"
                      incrementButtonIcon="pi pi-plus"
                      decrementButtonIcon="pi pi-minus"
                      @input="throttledUpdatePeople"
                      class="w-full people-counter"
                      fluid
                    />
                  </div>
                </div>

                <!-- 테마 -->
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-primary-800">테마</label>
                  <div class="w-40">
                    <Select
                      v-model="selectedThemeId"
                      :options="planThemes"
                      option-label="label"
                      option-value="themeId"
                      placeholder="테마 선택"
                      :disabled="!isCurrentUserHost"
                      class="w-full theme-select !text-sm"
                      fluid
                    />
                  </div>
                </div>

                <!-- 날짜 -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-primary-800">시작 날짜</label>
                    <div class="w-40">
                      <DatePicker
                        :model-value="plan.startDate ? new Date(plan.startDate) : undefined"
                        @update:model-value="
                          (date) =>
                            _updatePlan({
                              startDate: Array.isArray(date)
                                ? date[0] || undefined
                                : date || undefined,
                            })
                        "
                        :max-date="plan.endDate ? new Date(plan.endDate) : undefined"
                        :disabled="!isCurrentUserHost"
                        placeholder="시작 날짜"
                        date-format="yy/mm/dd"
                        class="w-full date-picker !text-sm"
                        fluid
                        showIcon
                      />
                    </div>
                  </div>

                  <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-primary-800">종료 날짜</label>
                    <div class="w-40">
                      <DatePicker
                        :model-value="plan.endDate ? new Date(plan.endDate) : undefined"
                        @update:model-value="
                          (date) =>
                            _updatePlan({
                              endDate: Array.isArray(date)
                                ? date[0] || undefined
                                : date || undefined,
                            })
                        "
                        :min-date="plan.startDate ? new Date(plan.startDate) : undefined"
                        :disabled="!isCurrentUserHost"
                        placeholder="종료 날짜"
                        date-format="yy/mm/dd"
                        class="w-full date-picker !text-sm"
                        fluid
                        showIcon
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 참여자 영역 -->
          <div class="pt-4 pr-4">
            <div
              class="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-secondary-200 p-6"
            >
              <div
                class="flex items-center justify-between mb-4 cursor-pointer select-none hover:bg-secondary-50 -mx-2 px-2 py-2 rounded-lg transition-colors duration-200"
                @click="toggleParticipants"
              >
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 bg-secondary-600 rounded-lg flex items-center justify-center mr-3"
                  >
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
                      />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-primary-800">참여자</h3>
                </div>

                <div class="flex items-center space-x-2">
                  <!-- 초대 링크 생성 버튼 -->
                  <button
                    v-if="isCurrentUserHost"
                    @click.stop="handleInviteParticipant"
                    class="flex items-center justify-center w-8 h-8 text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-full transition-colors duration-200"
                    title="초대 링크 생성"
                  >
                    <font-awesome-icon :icon="['fas', 'link']" class="text-sm" />
                  </button>
                  <div
                    class="transition-transform duration-200"
                    :class="{ 'rotate-180': !isParticipantsExpanded }"
                  >
                    <svg class="w-5 h-5 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div v-show="isParticipantsExpanded" class="transition-all duration-300">
                <div v-if="participants && participants.length > 0" class="space-y-3">
                  <div
                    v-for="participant in sortedParticipants"
                    :key="participant.userId"
                    class="bg-white rounded-xl border border-secondary-200 hover:border-secondary-300 transition-all duration-200 overflow-hidden"
                  >
                    <div class="p-4">
                      <!-- 프로필 + 이름 + 배지 + 권한 편집 + 추방 버튼 -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3 flex-1 min-w-0">
                          <!-- 프로필 아이콘 -->
                          <mock-profile-icon :nickname="participant.nickname" :size="36" />

                          <!-- 이름과 배지들 -->
                          <div class="flex items-center space-x-2 flex-1 min-w-0">
                            <h4 class="font-semibold text-primary-800 text-base truncate">
                              {{ participant.nickname }}
                            </h4>

                            <!-- 나 표시 -->
                            <span
                              v-if="participant.userId === tempUserId"
                              class="px-2 py-0.5 text-xs font-semibold bg-accent-100 text-accent-700 rounded-full border border-accent-200 flex-shrink-0"
                            >
                              나
                            </span>

                            <!-- 주최자 배지 -->
                            <div
                              v-if="plan && plan.ownerId === participant.userId"
                              class="flex items-center justify-center w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-sm flex-shrink-0"
                              title="주최자"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'crown']"
                                class="text-white text-xs"
                              />
                            </div>

                            <!-- 스태프 배지 -->
                            <div
                              v-else-if="isParticipantStaff(participant)"
                              class="flex items-center justify-center w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm flex-shrink-0"
                              title="스태프"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'shield-alt']"
                                class="text-white text-xs"
                              />
                            </div>

                            <!-- 닉네임 편집 버튼 (나일 경우만) -->
                            <button
                              v-if="participant.userId === tempUserId"
                              @click="startEditNickname(participant)"
                              class="flex items-center justify-center w-5 h-5 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-full transition-colors flex-shrink-0"
                              title="닉네임 편집"
                            >
                              <font-awesome-icon :icon="['fas', 'edit']" class="text-xs" />
                            </button>

                            <!-- 권한 편집 버튼 (주최자만, 본인 제외) -->
                            <button
                              v-if="isCurrentUserHost && plan.ownerId !== participant.userId"
                              @click="
                                handleChangeParticipantRole(
                                  participant,
                                  participant.role === 'owner' ? 'member' : 'owner',
                                )
                              "
                              class="flex items-center justify-center w-5 h-5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
                              :title="
                                participant.role === 'owner'
                                  ? '관리자 권한 해제'
                                  : '관리자 권한 부여'
                              "
                            >
                              <font-awesome-icon :icon="['fas', 'user-cog']" class="text-xs" />
                            </button>
                          </div>
                        </div>

                        <!-- 추방 버튼 (주최자만, 본인 제외) -->
                        <button
                          v-if="isCurrentUserHost && plan.ownerId !== participant.userId"
                          @click="handleRemoveParticipant(participant)"
                          class="flex items-center justify-center w-7 h-7 text-accent-600 hover:text-accent-800 hover:bg-accent-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-accent-200 flex-shrink-0"
                          title="추방"
                        >
                          <font-awesome-icon
                            :icon="['fas', 'times']"
                            class="text-sm group-hover:scale-110 transition-transform"
                          />
                        </button>
                      </div>

                      <!-- 닉네임 편집 폼 -->
                      <div
                        v-if="editingNickname === participant.userId"
                        class="mt-3 pt-3 border-t border-secondary-200"
                      >
                        <div class="flex items-center space-x-3">
                          <div class="flex-1">
                            <input
                              v-model="editNicknameValue"
                              type="text"
                              class="w-full nickname-edit-input px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
                              placeholder="새로운 닉네임을 입력하세요"
                              @keyup.enter="saveEditNickname"
                              @keyup.escape="cancelEditNickname"
                            />
                          </div>
                          <button
                            @click="saveEditNickname"
                            class="flex items-center justify-center w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                            title="저장"
                          >
                            <font-awesome-icon :icon="['fas', 'check']" class="text-sm" />
                          </button>
                          <button
                            @click="cancelEditNickname"
                            class="flex items-center justify-center w-8 h-8 bg-secondary-400 hover:bg-secondary-500 text-white rounded-lg transition-colors"
                            title="취소"
                          >
                            <font-awesome-icon :icon="['fas', 'times']" class="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-else
                  class="flex flex-col items-center justify-center py-8 text-secondary-500"
                >
                  <svg
                    class="w-12 h-12 text-secondary-300 mb-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
                    />
                  </svg>
                  <span class="text-center">참여자가 없습니다.</span>
                </div>
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
                class="w-full select-custom !text-sm"
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
                class="w-full select-custom !text-sm"
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
                @keyup.enter="handleSearch"
              />
            </div>
            <button
              @click="handleSearch"
              :disabled="!isSearchEnabled"
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
                  class="px-3 py-1.5 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
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
    :plan-id="planId!"
    :initial-description="plan?.description"
    :initial-people="plan?.people"
    :initial-theme-id="plan?.themeId"
    @complete="handleWizardComplete"
    @never-show-again="handleWizardNeverShow"
  />

  <!-- 초대 링크 Popover -->
  <Popover ref="invitePopover" class="w-80">
    <div class="p-4">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-primary-800 mb-2 flex items-center">
          <font-awesome-icon :icon="['fas', 'link']" class="text-primary-600 mr-2" />
          초대 링크
        </h3>
        <p class="text-sm text-secondary-600">
          이 링크를 공유하여 다른 사람들을 플랜에 초대하세요.
        </p>
      </div>

      <!-- 로딩 중 상태 -->
      <div v-if="isCreatingInviteCode" class="flex flex-col items-center justify-center py-8">
        <font-awesome-icon
          :icon="['fas', 'spinner']"
          class="text-2xl text-primary-600 animate-spin mb-3"
        />
        <p class="text-sm text-secondary-600">초대 링크를 생성하고 있습니다...</p>
      </div>

      <!-- 초대 링크가 없을 때 - 생성 버튼 -->
      <div v-else-if="!inviteCode" class="text-center py-4">
        <button
          @click="generateInviteLink"
          class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center mx-auto"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
          초대 링크 생성
        </button>
      </div>

      <!-- 초대 링크 생성 완료 -->
      <div v-else class="space-y-4">
        <!-- 초대 링크 표시 -->
        <div class="bg-secondary-50 border border-secondary-200 rounded-lg p-3">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0 mr-3">
              <p class="text-xs text-secondary-600 break-all">
                {{ inviteUrl }}
              </p>
            </div>
            <button
              @click="copyInviteLink"
              class="flex items-center justify-center w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex-shrink-0"
              title="링크 복사"
            >
              <font-awesome-icon :icon="['fas', 'copy']" class="text-sm" />
            </button>
          </div>
        </div>

        <!-- 유효기간 표시 -->
        <div class="bg-accent-50 border border-accent-200 rounded-lg p-3">
          <div class="flex items-center">
            <font-awesome-icon :icon="['fas', 'clock']" class="text-accent-600 mr-2" />
            <div>
              <p class="text-sm font-medium text-accent-800">유효기간</p>
              <p class="text-xs text-accent-600">
                {{
                  inviteCode.validUntil.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}까지
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Popover>
</template>

<style scoped>
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
  width: 320px;
  height: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
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
  position: absolute;
  top: var(--nav-height);
  right: 0;
  width: 360px;
  height: calc(100% - var(--nav-height));
  background: transparent;
  z-index: 30;
  overflow-y: auto;
  pointer-events: none;
}

.plan-right-panel::-webkit-scrollbar {
  display: none;
}

.plan-right-panel > * {
  pointer-events: auto;
}

.search-view-container {
  flex: 1;
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

/* PrimeVue 컴포넌트 커스터마이징 */
:deep(.people-counter) {
  .p-inputnumber-input {
    border-color: #e6e6cc;
    text-align: center;
    font-weight: 500;
    font-size: 0.875rem; /* text-sm */
  }

  .p-inputnumber-input:focus {
    border-color: #a8a868;
    box-shadow: 0 0 0 2px #f0f0e0;
    outline: none;
  }

  .p-inputnumber-buttons-horizontal .p-button {
    background-color: #9d9d60;
    border-color: #9d9d60;
    color: white;
  }

  .p-inputnumber-buttons-horizontal .p-button:hover {
    background-color: #7a7a40;
    border-color: #7a7a40;
  }

  .p-inputnumber-buttons-horizontal .p-button:disabled {
    background-color: #d4d4a6;
    border-color: #d4d4a6;
    opacity: 0.6;
  }
}

:deep(.theme-select) {
  .p-select-dropdown {
    border-color: #e6e6cc;
  }

  .p-select-dropdown:focus {
    border-color: #a8a868;
    box-shadow: 0 0 0 2px #f0f0e0;
    outline: none;
  }

  .p-select-dropdown:not(.p-disabled):hover {
    border-color: #c0c080;
  }
}

:deep(.date-picker) {
  .p-datepicker-input {
    font-size: 0.875rem; /* text-sm */
    border-color: #e6e6cc;
  }

  .p-datepicker-input:focus {
    border-color: #a8a868;
    box-shadow: 0 0 0 2px #f0f0e0;
    outline: none;
  }

  .p-datepicker-input:not(.p-disabled):hover {
    border-color: #c0c080;
  }

  .p-datepicker-trigger-icon {
    color: #9d9d60;
  }
}

/* 참여자 권한 편집 Select 스타일링 */
:deep(.participant-role-select) {
  .p-select-dropdown {
    border-color: #e6e6cc;
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
  }

  .p-select-dropdown:focus {
    border-color: #a8a868;
    box-shadow: 0 0 0 2px #f0f0e0;
    outline: none;
  }

  .p-select-dropdown:not(.p-disabled):hover {
    border-color: #c0c080;
  }

  .p-select-dropdown.p-disabled {
    background-color: #faf6f0;
    color: #9d7c56;
    border-color: #ead5c1;
    cursor: not-allowed;
    opacity: 0.8;
  }
}
</style>
