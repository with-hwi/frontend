import { PUBLIC_DATA_API_BASE_URL } from '@/constants/urls'
import axios from './axiosInstance'

const defaultParams = {
  MobileOS: 'ETC',
  MobileApp: 'EnjoyTrip',
  _type: 'json',
  serviceKey: import.meta.env.VITE_PUBLIC_DATA_API_KEY,
}

const defaultHeaders = {
  // ...axios.defaults.headers,
  'ngrok-skip-browser-warning': '6024',
}

const paginationParams = ({
  numOfRows = 100,
  pageNo = 1,
}: { numOfRows?: number; pageNo?: number } = {}) => ({
  numOfRows: numOfRows,
  pageNo: pageNo,
})

const getSido = () =>
  axios.get(`https://4b95-106-101-128-8.ngrok-free.app/api/v1/attractions/areas`, {
    params: {
      ...defaultParams,
      ...paginationParams(),
    },
    headers: {
      ...defaultHeaders,
    },
  })

const getSigungu = ({ areaCode }: { areaCode: string | number }) =>
  axios.get(`https://4b95-106-101-128-8.ngrok-free.app/api/v1/attractions/areas`, {
    params: {
      ...defaultParams,
      ...paginationParams(),
      areaCode,
    },
    headers: {
      ...defaultHeaders,
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
  axios.get(`https://4b95-106-101-128-8.ngrok-free.app/api/v1/attractions`, {
    params: {
      areaCode: sidoCode,
      sigunguCode,
      page,
      size,
      keyword,
    },
    headers: {
      ...defaultHeaders,
    },
  })

export default { getSido, getSigungu, getAttractions }
