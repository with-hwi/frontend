<script setup lang="ts">
import KakaoMap from '@/components/map/KakaoMap.vue'
import AttractionInfoWindow from '@/components/map/AttractionInfoWindow.vue'
import Pagination from '@/components/Pagination.vue'
import { ref, onMounted, computed, h, render } from 'vue'
import type { AttractionItem } from '@/types/tour'
import { useTourStore } from '@/stores/tourStore'
import { getAttractions } from '@/services/tourService'

// 검색 키워드
const keyword = ref<string>('')

// 검색 결과를 저장할 상태
const searchResults = ref<AttractionItem[] | undefined>([])

// 투어 스토어 사용
const tourStore = useTourStore()

const tourList = ref<AttractionItem[] | undefined>([])
const selectedSido = ref<string>('')
const selectedSigungu = ref<string>('')
const isTourLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const isPanelHidden = ref(false)

// 선택된 여행지 상태
const selectedAttraction = ref<AttractionItem | null>(null)
// 마우스 호버된 여행지 상태
const hoveredAttraction = ref<AttractionItem | null>(null)
const attractionInfoContent = ref<string>('')

// 선택한 시도에 따른 시군구 목록 계산
const sigunguList = computed(() => {
  return tourStore.getSigunguListBySido(selectedSido.value)
})

// 관광지 목록 조회
// TODO: 키워드 검색 구현
const fetchTourList = async () => {
  isTourLoading.value = true
  try {
    const response = await getAttractions({
      sidoCode: selectedSido.value,
      sigunguCode: selectedSigungu.value,
      pageNo: currentPage.value,
      numOfRows: pageSize.value,
    })
    tourList.value = response.items
    totalCount.value = response.totalCount
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

const handlePageChange = (page: number) => {
  currentPage.value = page
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

// 검색 패널 토글
const togglePanel = () => {
  isPanelHidden.value = !isPanelHidden.value
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

onMounted(() => {
  // 컴포넌트 마운트 시 시도 목록 조회
  tourStore.fetchSidoList()
})
</script>

<template>
  <div id="search-view-container">
    <KakaoMap
      id="map"
      :attractions="searchResults"
      :selected-attraction="selectedAttraction"
      :hovered-attraction="hoveredAttraction"
      :attraction-info-content="attractionInfoContent"
      @marker-click="handleMarkerClick"
    />
    <div class="overlay-container" :class="{ 'panel-hidden': isPanelHidden }">
      <button class="toggle-panel-btn" @click="togglePanel">
        {{ isPanelHidden ? '>' : '<' }}
      </button>
      <div class="search-container">
        <div class="search-card">
          <div class="tour-search">
            <div class="search-form">
              <div class="area-form">
                <div class="form-group">
                  <label for="sido">시/도</label>
                  <select
                    id="sido"
                    v-model="selectedSido"
                    @change="handleSidoChange"
                    :disabled="isTourLoading || tourStore.isSidoLoading"
                  >
                    <option value="">시/도 선택</option>
                    <option v-for="sido in tourStore.sidoList" :key="sido.code" :value="sido.code">
                      {{ sido.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="sigungu">시/군/구</label>
                  <select
                    id="sigungu"
                    v-model="selectedSigungu"
                    :disabled="isTourLoading || tourStore.isSigunguLoading || !selectedSido"
                  >
                    <option value="">시/군/구 선택</option>
                    <option
                      v-for="sigungu in sigunguList"
                      :key="sigungu.code"
                      :value="sigungu.code"
                    >
                      {{ sigungu.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="keyword-form">
                <input
                  type="text"
                  class="keyword-input"
                  v-model="keyword"
                  placeholder="검색어를 입력해주세요."
                />
                <button @click="handleSearch" :disabled="isTourLoading || !selectedSido">
                  {{ isTourLoading ? '검색 중...' : '검색' }}
                </button>
              </div>
            </div>
          </div>
          <!-- 검색 결과 표시 -->
          <div class="results-container">
            <div v-if="searchResults === undefined">
              <div>
                <span>검색에 실패하였습니다.</span>
                <button @click="handleRetry">재시도</button>
              </div>
            </div>
            <div v-else-if="searchResults.length === 0" class="no-results">
              검색 결과가 없습니다.<br />지역을 선택하고 검색해 보세요.
            </div>
            <div v-else-if="isTourLoading" class="loading">로딩 중...</div>
            <ul v-else class="search-results">
              <li
                v-for="item in searchResults"
                :key="item.contentid"
                class="result-item"
                :class="{
                  'result-item-selected':
                    selectedAttraction && selectedAttraction.contentid === item.contentid,
                }"
                @click="handleResultItemClick(item)"
                @mouseenter="handleResultItemMouseEnter(item)"
                @mouseleave="handleResultItemMouseLeave"
              >
                <div class="result-image">
                  <img v-if="item.firstimage" :src="item.firstimage" :alt="item.title" />
                  <div v-else class="no-image">이미지 없음</div>
                </div>
                <div class="result-info">
                  <h3>{{ item.title }}</h3>
                  <p class="address">{{ item.addr1 }} {{ item.addr2 }}</p>
                  <p v-if="item.tel" class="tel">{{ item.tel }}</p>
                </div>
              </li>
            </ul>
          </div>
          <Pagination
            class="pagination"
            v-if="searchResults && searchResults.length > 0"
            :current-page="currentPage"
            :page-size="pageSize"
            :total-count="totalCount"
            :loading="isTourLoading"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#search-view-container {
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

.search-container {
  width: 100%;
  height: 100%;
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
  --search-card-margin: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.results-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.no-results {
  text-align: center;
  color: #666;
  margin-top: 2rem;
}

.search-results {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.result-item:hover {
  background-color: #f5f5f5;
}

.result-item-selected {
  background-color: #e8f0fe;
  border-left: 3px solid #4285f4;
  padding-left: 8px;
}

.result-image {
  width: 100px;
  height: 80px;
  overflow: hidden;
  background-color: #f0f0f0;
  margin-right: 1rem;
  flex-shrink: 0;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.8rem;
}

.result-info {
  flex: 1;
}

.result-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.result-info .address,
.result-info .tel {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #666;
}

#map {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

/* TourSearch 스타일 통합 */
.tour-search {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 0.5rem;
}

.area-form {
  display: flex;
  gap: 1rem;
}

.keyword-form {
  display: flex;
  gap: 1rem;
}

.keyword-input {
  flex-grow: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 100px;
  gap: 0.5rem;
}

.tour-search select,
.tour-search button {
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #ccc;
}

.tour-search button {
  align-self: flex-end;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: auto;
}

.tour-search button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.pagination {
  padding: 0 2rem 2rem;
}
</style>
