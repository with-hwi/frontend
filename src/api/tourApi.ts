import { API_BASE_URL } from '@/constants/urls'
import axios from './axiosInstance'

const defaultParams = {
  MobileOS: 'ETC',
  MobileApp: 'EnjoyTrip',
  _type: 'json',
  serviceKey: import.meta.env.VITE_PUBLIC_DATA_API_KEY,
}

const paginationParams = ({
  numOfRows = 100,
  pageNo = 1,
}: { numOfRows?: number; pageNo?: number } = {}) => ({
  numOfRows: numOfRows,
  pageNo: pageNo,
})

const getSido = () =>
  axios.get(`${API_BASE_URL}/api/v1/attractions/areas`, {
    params: {
      ...defaultParams,
      ...paginationParams(),
    },
  })

const getSigungu = ({ areaCode }: { areaCode: string | number }) =>
  axios.get(`${API_BASE_URL}/api/v1/attractions/areas`, {
    params: {
      ...defaultParams,
      ...paginationParams(),
      areaCode,
    },
  })

const getAttractions = ({
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
}) =>
  axios.get(`${API_BASE_URL}/api/v1/attractions`, {
    params: {
      areaCode: sidoCode,
      sigunguCode,
      page,
      size,
      keyword,
    },
  })

export default { getSido, getSigungu, getAttractions }
