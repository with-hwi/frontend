import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getSido, getSigungu } from '@/services/tourService'
import type { SidoItem, SigunguItem } from '@/types/tour'

export const useTourStore = defineStore('tour', () => {
  // 상태 정의
  const sidoList = ref<SidoItem[]>([])
  const sigunguListMap = ref<Record<string, SigunguItem[]>>({})
  const isSidoLoading = ref(false)
  const isSigunguLoading = ref(false)

  // 시도 목록 조회
  const fetchSidoList = async () => {
    // 이미 데이터가 있으면 다시 조회하지 않음
    if (sidoList.value.length > 0) return

    isSidoLoading.value = true
    try {
      const response = await getSido()
      sidoList.value = response
    } catch (error) {
      console.error('시도 목록 조회 실패:', error)
    } finally {
      isSidoLoading.value = false
    }
  }

  // 시군구 목록 조회
  const fetchSigunguList = async (areaCode: string) => {
    if (!areaCode) return

    // 이미 데이터가 있으면 다시 조회하지 않음
    if (sigunguListMap.value[areaCode]) return

    isSigunguLoading.value = true
    try {
      const response = await getSigungu({ areaCode })
      sigunguListMap.value[areaCode] = response
    } catch (error) {
      console.error('시군구 목록 조회 실패:', error)
    } finally {
      isSigunguLoading.value = false
    }
  }

  // 특정 시도에 대한 시군구 목록 가져오기
  const getSigunguListBySido = (areaCode: string): SigunguItem[] => {
    return sigunguListMap.value[areaCode] || []
  }

  return {
    sidoList,
    isSidoLoading,
    isSigunguLoading,
    fetchSidoList,
    fetchSigunguList,
    getSigunguListBySido,
  }
})
