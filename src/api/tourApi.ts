import { PUBLIC_DATA_API_BASE_URL } from '@/constants/urls'
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
  axios.get(`${PUBLIC_DATA_API_BASE_URL}/areaCode1`, {
    params: {
      ...defaultParams,
      ...paginationParams(),
    },
  })

const getSigungu = ({ areaCode }: { areaCode: string | number }) =>
  axios.get(`${PUBLIC_DATA_API_BASE_URL}/areaCode1`, {
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
  pageNo,
  numOfRows,
}: {
  sidoCode?: string
  sigunguCode?: string
  contentTypeId?: string
  pageNo?: number
  numOfRows?: number
}) =>
  axios.get(`${PUBLIC_DATA_API_BASE_URL}/areaBasedList1`, {
    params: {
      ...defaultParams,
      ...paginationParams({ numOfRows, pageNo }),
      areaCode: sidoCode,
      sigunguCode,
      contentTypeId,
    },
  })

export default { getSido, getSigungu, getAttractions }
