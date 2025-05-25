<script setup lang="ts">
import type { PointItem } from '@/types/plan'
import PointCard from '@/components/plan/PointCard.vue'
import { ref, computed, watch, onUpdated, reactive } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

const props = defineProps<{
  points: PointItem[]
  hoveredPoint: PointItem | null
  editable?: boolean
}>()

const emit = defineEmits<{
  deletePoint: [PointItem]
  updatePoint: [PointItem]
  mouseenter: [PointItem]
  mouseleave: [PointItem]
  pointClick: [PointItem]
}>()

const handleDeleteClick = (point: PointItem) => {
  emit('deletePoint', point)
  // points.value = points.value.filter((p) => p.pointId !== point.pointId)
}

const handleUpdateTime = (point: PointItem, startDate: Date, endDate: Date) => {
  emit('updatePoint', { ...point, startDate, endDate })
  // points.value = points.value
  //   .map((p) => {
  //     if (p.pointId === point.pointId) {
  //       return { ...p, startDate, endDate }
  //     }
  //     return p
  //   })
  //   .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
}

// 년월일이 같은지 비교
const isSameDay = (date1?: Date, date2?: Date): boolean => {
  return (
    date1?.getFullYear() === date2?.getFullYear() &&
    date1?.getMonth() === date2?.getMonth() &&
    date1?.getDate() === date2?.getDate()
  )
}
const getDateOnly = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// 포인트 리스트에 표시할 항목들
// 날짜 혹은 PointCard로 이루어짐
// const pointListItems = reactive<(Date | PointItem)[]>([])
// watch(points, ()=>{

// let prevDate: Date | undefined

// points.value.forEach((point) => {
//   if (point.startDate) {
//     const currentDate = getDateOnly(point.startDate)

//     // 이전 날짜가 없거나 현재 포인트의 날짜가 이전 날짜와 다른 경우
//     if (!isSameDay(prevDate, currentDate)) {
//       result.push(currentDate) // 날짜를 먼저 추가
//       prevDate = currentDate
//     }
//   }

//   result.push(point) // 포인트 추가
// })

// })
const pointListItems = computed(() => {
  const result: (Date | PointItem)[] = []

  let prevDate: Date | undefined

  props.points
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .forEach((point) => {
      if (point.startDate) {
        const currentDate = getDateOnly(point.startDate)

        // 이전 날짜가 없거나 현재 포인트의 날짜가 이전 날짜와 다른 경우
        if (!isSameDay(prevDate, currentDate)) {
          result.push(currentDate) // 날짜를 먼저 추가
          prevDate = currentDate
        }
      }

      result.push(point) // 포인트 추가
    })

  return result
})

const getPointItemKey = (item: Date | PointItem): string => {
  return item instanceof Date ? getDateOnly(item).getTime().toString() : item.pointId.toString()
}

// 드래그 앤 드랍 이벤트 핸들러
const handleDragEnd = (evt: any) => {
  if (!evt.data.hasOwnProperty('pointId')) {
    console.error('DND target must always be PointItem')
    return
  }
  const newPoint = evt.data as PointItem
  const oldIndex = evt.oldIndex as number
  const newIndex = evt.newIndex as number

  if (oldIndex === newIndex) {
    return
  }

  // 지속 시간 계산
  const duration = newPoint.endDate.getTime() - newPoint.startDate.getTime()

  // 이전과 다음 포인트 찾기
  let prevPoint: PointItem | undefined
  for (let i = oldIndex < newIndex ? newIndex : newIndex - 1; i >= 0; i--) {
    if (
      typeof pointListItems.value[i] === 'object' &&
      pointListItems.value[i].hasOwnProperty('pointId') &&
      (pointListItems.value[i] as PointItem).pointId !== newPoint.pointId
    ) {
      prevPoint = pointListItems.value[i] as PointItem
      break
    }
  }
  let nextPoint: PointItem | undefined
  for (
    let i = oldIndex > newIndex ? newIndex : newIndex + 1;
    i < pointListItems.value.length;
    i++
  ) {
    if (
      typeof pointListItems.value[i] === 'object' &&
      pointListItems.value[i].hasOwnProperty('pointId') &&
      (pointListItems.value[i] as PointItem).pointId !== newPoint.pointId
    ) {
      nextPoint = pointListItems.value[i] as PointItem
      break
    }
  }

  // 이전 포인트가 있고 newPoint의 시작 시간이 이전 포인트의 종료 시간보다 빠른 경우 조정
  if (prevPoint && newPoint.startDate < prevPoint.endDate) {
    newPoint.startDate = new Date(prevPoint.endDate)
    newPoint.endDate = new Date(newPoint.startDate.getTime() + duration)
  }

  // 다음 포인트가 있고 newPoint의 종료 시간이 다음 포인트의 시작 시간보다 이후인 경우 조정
  if (nextPoint && newPoint.endDate > nextPoint.startDate) {
    newPoint.endDate = new Date(nextPoint.startDate)
    newPoint.startDate = new Date(newPoint.endDate.getTime() - duration)
  }

  // 한번 더 이전 포인트와 겹치는지 확인하고 조정
  if (prevPoint && newPoint.startDate < prevPoint.endDate) {
    newPoint.startDate = new Date(prevPoint.endDate)
  }

  // 포인트 업데이트
  emit('updatePoint', newPoint)
  // points.value = points.value.map((p) => {
  //   if (p.pointId === newPoint.pointId) {
  //     return newPoint
  //   }
  //   return p
  // })
}

// 드래그 가능한 항목인지 확인
const isDraggable = (item: Date | PointItem): boolean => {
  return typeof item === 'object' && 'pointId' in item
}

// 현재 포인트가 날짜 그룹의 첫 번째인지 확인
const isFirstInDateGroup = (item: PointItem): boolean => {
  const currentIndex = pointListItems.value.findIndex((p) => p === item)
  if (currentIndex <= 0) return true

  // 바로 이전 항목이 Date인지 확인
  const prevItem = pointListItems.value[currentIndex - 1]
  return prevItem instanceof Date
}

// 현재 포인트가 날짜 그룹의 마지막인지 확인
const isLastInDateGroup = (item: PointItem): boolean => {
  const currentIndex = pointListItems.value.findIndex((p) => p === item)
  if (currentIndex >= pointListItems.value.length - 1) return true

  // 바로 다음 항목이 Date인지 확인
  const nextItem = pointListItems.value[currentIndex + 1]
  return nextItem instanceof Date
}
</script>

<template>
  <div class="space-y-2">
    <!-- pointListItems는 computed 값이므로 업데이트가 불가하여 `@update:model-value` 비활성화 -->
    <!-- 리스트 순서 업데이트는 handleDragEnd 함수에서 별도로 실행함 -->
    <vue-draggable
      :model-value="pointListItems"
      @update:model-value="() => {}"
      @end="handleDragEnd"
      :animation="150"
      handle=".drag-handle"
      class="space-y-3"
    >
      <div
        v-for="item in pointListItems"
        :key="getPointItemKey(item)"
        class="group my-4 first:mt-0"
      >
        <!-- 날짜 헤더 -->
        <div v-if="item instanceof Date" class="flex items-center">
          <div class="flex-1 h-px mx-4 bg-primary-200"></div>
          <div class="px-4 py-1 bg-primary-100 rounded-full border border-primary-200">
            <span class="text-sm font-semibold text-primary-700">
              {{
                item.toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })
              }}
            </span>
          </div>
          <div class="flex-1 h-px mx-4 bg-primary-200"></div>
        </div>

        <!-- 포인트 카드 -->
        <div
          v-else-if="typeof item === 'object' && 'pointId' in item"
          class="flex items-start space-x-3 point-item"
          :class="{
            'has-connection-above': !isFirstInDateGroup(item),
            'has-connection-below': !isLastInDateGroup(item),
          }"
        >
          <!-- 번호 뱃지 -->
          <div class="flex flex-col items-center flex-shrink-0 mt-3">
            <div
              class="relative w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md z-10"
            >
              <span class="text-white text-sm font-bold">
                {{
                  pointListItems
                    .filter((p) => typeof p === 'object' && 'pointId' in p)
                    .findIndex((p) => p === item) + 1
                }}
              </span>
            </div>
          </div>

          <!-- 포인트 카드 -->
          <div class="flex-1">
            <point-card
              :point="item"
              :highlighted="hoveredPoint?.pointId === item.pointId"
              :editable="editable"
              :show-drag-handle="editable && isDraggable(item)"
              @delete-click="handleDeleteClick"
              @update-time="handleUpdateTime"
              @mouseenter="emit('mouseenter', $event)"
              @mouseleave="emit('mouseleave', $event)"
              @click="emit('pointClick', item)"
            />
          </div>
        </div>
      </div>
    </vue-draggable>
  </div>
</template>

<style scoped>
/* 포인트 아이템 연결선 처리 */
.point-item {
  position: relative;
}

/* 위쪽 연결선 */
.point-item.has-connection-above::before {
  content: '';
  position: absolute;
  left: 15px; /* 번호 뱃지 중앙 위치 (32px 뱃지의 절반) */
  top: -12px; /* space-y-3의 간격을 고려 */
  height: calc(12px + 16px); /* 간격 + 뱃지 상단까지 */
  width: 2px;
  background: linear-gradient(to bottom, rgb(230 230 204), rgb(212 212 166));
  z-index: 5;
}

/* 아래쪽 연결선 */
.point-item.has-connection-below::after {
  content: '';
  position: absolute;
  left: 15px; /* 번호 뱃지 중앙 위치 */
  top: calc(12px + 32px); /* mt-3 + 뱃지 높이 */
  bottom: -12px; /* 다음 아이템까지 연장 */
  width: 2px;
  background: linear-gradient(to bottom, rgb(212 212 166), rgb(230 230 204));
  z-index: 5;
}
</style>
