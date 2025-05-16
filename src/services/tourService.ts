import tourApi from '@/api/tourApi'
import type { AttractionItem, Pagination, SidoItem, SigunguItem } from '@/types/tour'

const parseResponse = <T>(response: any) => {
  return response.response.body.items.item as T[]
}

const parsePaginatedResponse = <T>(response: any) => {
  const body = response.response.body
  return {
    numOfRows: body.numOfRows,
    pageNo: body.pageNo,
    totalCount: body.totalCount,
    items: body.items.item as T[],
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
  pageNo,
  numOfRows,
}: {
  sidoCode?: string
  sigunguCode?: string
  contentTypeId?: string
  pageNo?: number
  numOfRows?: number
}) => {
  const response = await tourApi.getAttractions({
    sidoCode,
    sigunguCode,
    contentTypeId,
    pageNo,
    numOfRows,
  })
  return parsePaginatedResponse<AttractionItem>(response.data)
}

export { getSido, getSigungu, getAttractions }
