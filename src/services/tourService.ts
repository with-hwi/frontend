import tourApi from '@/api/tourApi'
import type { AttractionItem, Pagination, SidoItem, SigunguItem } from '@/types/tour'

const parseResponse = <T>(response: any) => {
  return response as T[]
}

const parsePaginatedResponse = <T>(response: any) => {
  const body = response
  return {
    content: body.content as T[],
    size: body.size,
    page: body.page,
    totalElements: body.totalElements,
    totalPages: body.totalPages,
  } as Pagination<T>
}

const getSido = async () => {
  const response = await tourApi.getSido()
  return parseResponse<SidoItem>(response.data)
}

const getSigungu = async ({ areaCode }: { areaCode: string | number }) => {
  const response = await tourApi.getSigungu({ areaCode })
  return parseResponse<SigunguItem>(response.data)
}

const getAttractions = async ({
  sidoCode,
  sigunguCode,
  contentTypeId,
  page,
  size,
  keyword,
}: {
  sidoCode?: string
  sigunguCode?: string
  contentTypeId?: string
  page?: number
  size?: number
  keyword?: string
}) => {
  const response = await tourApi.getAttractions({
    sidoCode,
    sigunguCode,
    // contentTypeId, // TODO: Add back later... maybe
    page,
    size,
    keyword,
  })
  return parsePaginatedResponse<AttractionItem>(response.data)
}

export { getSido, getSigungu, getAttractions }
