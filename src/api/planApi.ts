import { API_BASE_URL } from '@/constants/urls'
import axios from './axiosInstance'
import type {
  GetParticipantResDto,
  UpdatePlanReqDto,
  UpdatePlanResDto,
  CreatePointResDto,
  GetPlanResDto,
  CreatePlanReqDto,
  CreatePlanResDto,
  UpdatePointReqDto,
  UpdatePointResDto,
  PlanNicknameReqDto,
  PlanNicknameResDto,
  UpdateParticipantReqDto,
  UpdateParticipantResDto,
  CreatePointReqDto,
  GetPointsResDto,
} from '@/types/dto/plan'

const defaultParams = {}

const getPlan = (planId: number) =>
  axios.get<GetPlanResDto>(`${API_BASE_URL}/api/v1/plans/${planId}`, {
    params: {
      ...defaultParams,
    },
  })

const createPlan = (data: CreatePlanReqDto) =>
  axios.post<CreatePlanResDto>(`${API_BASE_URL}/api/v1/plans`, {
    ...data,
  })

const updatePlan = (planId: number, data: UpdatePlanReqDto = {}) =>
  axios.patch<UpdatePlanResDto>(`${API_BASE_URL}/api/v1/plans/${planId}`, {
    ...data,
  })

const deletePlan = (planId: number) => axios.delete(`${API_BASE_URL}/api/v1/plans/${planId}`)

const getPoints = (planId: number) =>
  axios.get<GetPointsResDto[]>(`${API_BASE_URL}/api/v1/plans/${planId}/points`, {
    params: {
      ...defaultParams,
    },
  })

const addPoint = (planId: number, data: CreatePointReqDto) =>
  axios.post<CreatePointResDto>(`${API_BASE_URL}/api/v1/plans/${planId}/points`, {
    ...data,
  })

const updatePoint = (planId: number, pointId: number, data: UpdatePointReqDto) =>
  axios.patch<UpdatePointResDto>(`${API_BASE_URL}/api/v1/plans/${planId}/points/${pointId}`, {
    ...data,
  })

const deletePoint = (planId: number, pointId: number) =>
  axios.delete(`${API_BASE_URL}/api/v1/plans/${planId}/points/${pointId}`)

const getParticipants = (planId: number) =>
  axios.get<GetParticipantResDto[]>(`${API_BASE_URL}/api/v1/plans/${planId}/participants`, {
    params: {
      ...defaultParams,
    },
  })

const updateParticipant = (planId: number, userId: number, data: UpdateParticipantReqDto) =>
  axios.patch<UpdateParticipantResDto>(
    `${API_BASE_URL}/api/v1/plans/${planId}/participants/${userId}`,
    {
      ...data,
    },
  )

const deleteParticipant = (planId: number, userId: number) =>
  axios.delete(`${API_BASE_URL}/api/v1/plans/${planId}/participants/${userId}`)

const updateNickname = (planId: number, userId: number, data: PlanNicknameReqDto) =>
  axios.put<PlanNicknameResDto>(`${API_BASE_URL}/api/v1/plans/${planId}/nickname/${userId}`, {
    ...data,
  })

export default {
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getParticipants,
  updateParticipant,
  deleteParticipant,
  getPoints,
  addPoint,
  updatePoint,
  deletePoint,
  updateNickname,
}
