<template>
  <div>
    <div id="map" ref="mapRef"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { h, render } from 'vue'
import type { AttractionItem } from '@/types/tour'
import NumberedMarker from '@/components/NumberedMarker.vue'
import type { PointItem } from '@/types/plan'

// Window with Kakao maps
declare global {
  interface Window {
    kakao: {
      maps: any
    }
    closeAttractionInfoOverlay?: () => void
  }
}

const props = defineProps<{
  attractions?: AttractionItem[]
  selectedAttractionOrPoint?: AttractionItem | PointItem | null
  hoveredAttraction?: AttractionItem | null
  attractionInfoContent?: string
  points?: PointItem[]
  hoveredPoint?: PointItem | null
}>()

const NORMAL_MARKER_SIZE = 36
const HOVER_MARKER_SIZE = 36

const emit = defineEmits<{
  'marker-click': [attraction: AttractionItem]
  'point-hover': [point: PointItem | null]
  'point-marker-click': [point: PointItem]
}>()

const mapRef = ref<HTMLElement | null>(null)
const kakaoMap = ref<any>(null)
const markers = ref<any[]>([])
const numberedOverlays = ref<any[]>([])
const polyline = ref<any>(null)
const attractionInfoOverlay = ref<any | null>(null)
const selectedMarker = ref<any>(undefined)
const hoveredMarker = ref<any>(undefined)

// 마커 이미지 관련 변수 선언
let normalMarkerImage: any
let hoverMarkerImage: any
let normalMarkerSize: any
let hoverMarkerSize: any

const loadScript = (): Promise<void> => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve()
      })
    }
    document.head.appendChild(script)
  })
}

const loadMap = () => {
  const options = {
    // 지도를 생성할 때 필요한 기본 옵션
    center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표.
    level: 3, // 지도의 레벨(확대, 축소 정도)
  }

  kakaoMap.value = new window.kakao.maps.Map(mapRef.value, options) // 지도 생성 및 객체 리턴

  // 마커 이미지 크기 초기화
  normalMarkerSize = new window.kakao.maps.Size(NORMAL_MARKER_SIZE, NORMAL_MARKER_SIZE) // 기본 마커 크기
  hoverMarkerSize = new window.kakao.maps.Size(HOVER_MARKER_SIZE, HOVER_MARKER_SIZE) // 확대된 마커 크기

  // 기본 마커 이미지 생성
  normalMarkerImage = new window.kakao.maps.MarkerImage(
    '/images/marker.png', // 마커 이미지 URL - public 폴더에 이미지 추가 필요
    normalMarkerSize,
    {
      offset: new window.kakao.maps.Point(NORMAL_MARKER_SIZE / 2, NORMAL_MARKER_SIZE), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
    },
  )

  // 마우스오버시 표시할 마커 이미지 생성
  hoverMarkerImage = new window.kakao.maps.MarkerImage(
    '/images/marker_hover.png', // 마커 이미지 URL - public 폴더에 이미지 추가 필요
    hoverMarkerSize,
    {
      offset: new window.kakao.maps.Point(HOVER_MARKER_SIZE / 2, HOVER_MARKER_SIZE), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
    },
  )

  // 여행지 정보 오버레이 객체 생성
  attractionInfoOverlay.value = new window.kakao.maps.CustomOverlay({
    content: '',
    position: null,
    xAnchor: 0.5,
    yAnchor: 1.3,
    zIndex: 3,
  })
}

// 마커 생성 및 표시
const displayMarkers = () => {
  // 기존 마커 제거
  clearMarkers()

  if (!props.attractions || props.attractions.length === 0) return

  // 새로운 마커 생성
  props.attractions.forEach((attraction) => {
    // 위도(latitude)와 경도(longitude) 정보가 있는지 확인
    if (!attraction.latitude || !attraction.longitude) return

    const position = new window.kakao.maps.LatLng(
      parseFloat(attraction.latitude),
      parseFloat(attraction.longitude),
    )

    // 마커 생성
    const marker = new window.kakao.maps.Marker({
      map: kakaoMap.value,
      position: position,
      title: attraction.title,
      image: normalMarkerImage,
    })

    // 마커에 attraction ID 저장
    // TODO: AttractionItem의 ID가 contentid 외에 다른 것으로 결정되면 수정 필요
    marker.attractionId = attraction.contentId

    // 마커 클릭 이벤트 - 부모 컴포넌트에 정보 전달
    window.kakao.maps.event.addListener(marker, 'click', function () {
      // 부모 컴포넌트에 클릭한 여행지 정보 전달
      emit('marker-click', attraction)

      // 지도 중심을 마커 위치로 이동
      // kakaoMap.value.setCenter(position)
      selectedMarker.value = marker
    })

    // 마커에 마우스오버 이벤트 등록
    window.kakao.maps.event.addListener(marker, 'mouseover', function () {
      marker.setImage(hoverMarkerImage) // 마커 이미지 변경
    })

    // 마커에 마우스아웃 이벤트 등록
    window.kakao.maps.event.addListener(marker, 'mouseout', function () {
      marker.setImage(normalMarkerImage) // 마커 이미지 원래대로
    })

    // 배열에 추가
    markers.value.push(marker)
  })

  // 마커가 있으면 지도 범위를 마커에 맞게 조정
  if (markers.value.length > 0) {
    const bounds = new window.kakao.maps.LatLngBounds()
    markers.value.forEach((marker) => {
      bounds.extend(marker.getPosition())
    })
    kakaoMap.value.setBounds(bounds)
  }
}

// 넘버링된 마커 생성 및 표시, 마커 간 선 그리기
const displayNumberedMarkers = () => {
  // 기존 넘버링된 마커와 선 제거
  clearNumberedMarkersAndLine()

  if (!props.points || props.points.length === 0) return

  const positions: any[] = []

  // 새로운 넘버링된 마커 생성
  props.points.forEach((point, index) => {
    if (!point.attraction.latitude || !point.attraction.longitude) return

    const position = new window.kakao.maps.LatLng(
      parseFloat(point.attraction.latitude),
      parseFloat(point.attraction.longitude),
    )
    positions.push(position)

    // NumberedMarker 컴포넌트를 사용하는 커스텀 오버레이 생성
    const markerEl = document.createElement('div')
    const vnode = h(NumberedMarker, {
      number: index + 1,
      highlighted: false,
    })
    render(vnode, markerEl)
    const customOverlay = new window.kakao.maps.CustomOverlay({
      map: kakaoMap.value,
      position: position,
      content: markerEl,
      yAnchor: 1.0,
      zIndex: 2,
    })

    markerEl.addEventListener('click', () => {
      emit('point-marker-click', point)
    })

    markerEl.addEventListener('mouseover', () => {
      // console.log('hover', point)
      emit('point-hover', point)
    })

    markerEl.addEventListener('mouseout', () => {
      // console.log('leave', point)
      emit('point-hover', null)
    })

    // 배열에 추가
    numberedOverlays.value.push({ overlay: customOverlay, container: markerEl })
  })

  console.log(positions)

  // 마커들 간에 선 그리기
  if (positions.length > 1) {
    polyline.value = new window.kakao.maps.Polyline({
      map: kakaoMap.value,
      path: positions,
      strokeWeight: 3,
      strokeColor: '#5882FA',
      strokeOpacity: 0.8,
      strokeStyle: 'dashed',
    })
  }

  // 마커가 있으면 지도 범위를 마커에 맞게 조정
  if (positions.length > 0) {
    const bounds = new window.kakao.maps.LatLngBounds()
    positions.forEach((position) => {
      bounds.extend(position)
    })
    kakaoMap.value.setBounds(bounds)
  }
}

// 넘버링된 마커와 선 제거
const clearNumberedMarkersAndLine = () => {
  // 넘버링된 마커 제거
  numberedOverlays.value.forEach(({ overlay, container }) => {
    overlay.setMap(null)
    render(null, container)
  })
  numberedOverlays.value = []

  // 선 제거
  if (polyline.value) {
    polyline.value.setMap(null)
    polyline.value = null
  }
}

// 선택된 여행지가 변경되었을 때 여행지 정보 오버레이 표시
watch(
  () => props.selectedAttractionOrPoint,
  (newAttraction) => {
    if (kakaoMap.value && attractionInfoOverlay.value) {
      // 여행지 정보 오버레이 닫기
      attractionInfoOverlay.value.setMap(null)

      if (!newAttraction) {
        return
      }

      const attraction = newAttraction.hasOwnProperty('attractionId')
        ? (newAttraction as AttractionItem)
        : ((newAttraction as PointItem).attraction as AttractionItem)

      if (attraction && attraction.latitude && attraction.longitude) {
        // 여행지 정보 오버레이 내용 설정
        if (props.attractionInfoContent) {
          // 여행지 정보 오버레이 위치 설정
          const position = new window.kakao.maps.LatLng(
            parseFloat(attraction.latitude),
            parseFloat(attraction.longitude),
          )

          // 여행지 정보 오버레이 내용 설정
          const content = `
            <div class="attraction-info-overlay">
              <div class="attraction-info-overlay-content">
                ${props.attractionInfoContent}
              </div>
              <div class="attraction-info-overlay-arrow"></div>
              <button class="attraction-info-overlay-close" onclick="window.closeAttractionInfoOverlay()">×</button>
            </div>
          `

          attractionInfoOverlay.value.setContent(content)
          attractionInfoOverlay.value.setPosition(position)
          attractionInfoOverlay.value.setMap(kakaoMap.value)
        }
      }
    }
  },
  { deep: true },
)

// 마우스 호버된 여행지가 변경되었을 때 마커 강조 표시
watch(
  () => props.hoveredAttraction,
  (newHoveredAttraction) => {
    if (kakaoMap.value && markers.value.length > 0) {
      // 이전에 호버된 마커가 있으면 원래 이미지로 복원
      if (hoveredMarker.value) {
        hoveredMarker.value.setImage(normalMarkerImage)
        hoveredMarker.value = undefined
      }

      // 새로 호버된 마커가 있으면 강조 이미지로 변경
      if (newHoveredAttraction && newHoveredAttraction.contentId) {
        const marker = markers.value.find(
          (marker) => marker.attractionId === newHoveredAttraction.contentId,
        )
        if (marker) {
          marker.setImage(hoverMarkerImage)
          hoveredMarker.value = marker
        }
      }
    }
  },
  { deep: true },
)

// 마우스 호버된 포인트가 변경되었을 때 넘버링된 마커 강조 표시
watch(
  () => props.hoveredPoint,
  (newHoveredPoint) => {
    if (kakaoMap.value && numberedOverlays.value.length > 0) {
      // 모든 마커를 기본 상태로 복원
      numberedOverlays.value.forEach(({ overlay, container }, index) => {
        const vnode = h(NumberedMarker, {
          number: index + 1,
          highlighted: false,
        })
        render(vnode, container)
      })

      // 호버된 포인트가 있으면 해당 마커를 강조
      if (newHoveredPoint) {
        const pointIndex = props.points?.findIndex((p) => p.pointId === newHoveredPoint.pointId)
        if (
          pointIndex !== undefined &&
          pointIndex >= 0 &&
          pointIndex < numberedOverlays.value.length
        ) {
          const { overlay, container } = numberedOverlays.value[pointIndex]
          const vnode = h(NumberedMarker, {
            number: pointIndex + 1,
            highlighted: true,
          })
          render(vnode, container)
        }
      }
    }
  },
  { deep: true },
)

// 여행지 정보 콘텐츠가 변경되었을 때 업데이트
watch(
  () => props.attractionInfoContent,
  (newContent) => {
    if (attractionInfoOverlay.value && newContent && props.selectedAttractionOrPoint) {
      const content = `
        <div class="attraction-info-overlay">
          <div class="attraction-info-overlay-content">
            ${newContent}
          </div>
          <div class="attraction-info-overlay-arrow"></div>
          <button class="attraction-info-overlay-close" onclick="window.closeAttractionInfoOverlay()">×</button>
        </div>
      `
      attractionInfoOverlay.value.setContent(content)
    }
  },
)

// points prop 변경 감지
watch(
  () => props.points,
  () => {
    if (kakaoMap.value) {
      displayNumberedMarkers()
    }
  },
  { deep: true },
)

// 모든 마커 제거
const clearMarkers = () => {
  markers.value.forEach((marker) => {
    marker.setMap(null)
  })
  markers.value = []

  // 여행지 정보 오버레이 닫기
  if (attractionInfoOverlay.value) {
    attractionInfoOverlay.value.setMap(null)
  }
}

// attractions prop 변경 감지
watch(
  () => props.attractions,
  () => {
    if (kakaoMap.value) {
      displayMarkers()
    }
  },
  { deep: true },
)

onMounted(async () => {
  if (!window.kakao || !window.kakao.maps) {
    await loadScript()
  }

  // 전역 함수 등록 - 여행지 정보 오버레이 닫기 기능
  window.closeAttractionInfoOverlay = () => {
    if (attractionInfoOverlay.value) {
      attractionInfoOverlay.value.setMap(null)
    }
  }

  loadMap()
  displayMarkers()
  displayNumberedMarkers()
})
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}

/* 여행지 정보 오버레이 스타일 */
:deep(.attraction-info-overlay) {
  position: relative;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  max-width: 320px;
  padding: 0;
  transform: translateY(-10px);
  transition: transform 0.2s ease;
  overflow: hidden;
}

:deep(.attraction-info-overlay-content) {
  padding: 15px;
}

:deep(.attraction-info-overlay-arrow) {
  position: absolute;
  bottom: -8px;
  left: 50%;
  width: 16px;
  height: 16px;
  background: #fff;
  transform: translateX(-50%) rotate(45deg);
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.1);
}

:deep(.attraction-info-overlay-close) {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: #333;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

:deep(.attraction-info-overlay-close:hover) {
  background: rgba(0, 0, 0, 0.2);
}

:deep(.attraction-info-window) {
  padding: 0;
  max-width: 100%;
}

:deep(.attraction-info-window h3) {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

:deep(.attraction-info-window p) {
  margin: 8px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

:deep(.attraction-info-image) {
  width: 100%;
  height: 160px;
  overflow: hidden;
  margin: 0 0 10px 0;
  border-radius: 6px;
}

:deep(.attraction-info-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

:deep(.attraction-info-image img:hover) {
  transform: scale(1.05);
}
</style>
