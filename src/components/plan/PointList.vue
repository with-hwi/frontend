<script setup lang="ts">
import type { PointItem } from '@/types/plan'
import PointCard from '@/components/plan/PointCard.vue'
import { ref, computed, watch, onUpdated, reactive } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

const props = defineProps<{
  points: PointItem[]
  hoveredPoint: PointItem | null
}>()

const emit = defineEmits<{
  deletePoint: [PointItem]
  updatePoint: [PointItem]
  mouseenter: [PointItem]
  mouseleave: [PointItem]
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
  console.log('com')

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
    console.log('Actual order did not change, skipping')
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

  console.log('newPoint', newPoint.attraction.title)

  console.log('oldIndex', oldIndex)

  console.log('newIndex', newIndex)

  console.log('prev', prevPoint?.attraction.title)
  console.log('next', nextPoint?.attraction.title)

  for (let i = 0; i < pointListItems.value.length; i++) {
    if (pointListItems.value[i].hasOwnProperty('pointId')) {
      console.log(i, (pointListItems.value[i] as PointItem).attraction.title)
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
</script>

<template>
  <div>
    <!-- pointListItems는 computed 값이므로 업데이트가 불가하여 `@update:model-value` 비활성화 -->
    <!-- 리스트 순서 업데이트는 handleDragEnd 함수에서 별도로 실행함 -->
    <vue-draggable
      :model-value="pointListItems"
      @update:model-value="() => {}"
      @end="handleDragEnd"
      :animation="150"
      handle=".drag-handle"
    >
      <div v-for="item in pointListItems" :key="getPointItemKey(item)">
        <div v-if="item instanceof Date" class="font-bold mt-3 mb-1">
          {{ item.toLocaleDateString() }}
        </div>

        <!-- 해당 날짜의 포인트 목록 -->
        <div v-else-if="typeof item === 'object' && 'pointId' in item" class="flex items-center">
          <div class="drag-handle p-1 mr-2 text-gray-500 cursor-move" v-if="isDraggable(item)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
              />
            </svg>
          </div>
          <point-card
            :point="item"
            :highlighted="hoveredPoint?.pointId === item.pointId"
            @delete-click="handleDeleteClick"
            @update-time="handleUpdateTime"
            @mouseenter="emit('mouseenter', $event)"
            @mouseleave="emit('mouseleave', $event)"
            class="flex-grow"
          />
        </div>

        <!-- 날짜 그룹 사이 간격 -->
        <div class="mb-5"></div>
      </div>
    </vue-draggable>
  </div>
</template>

<style scoped></style>
