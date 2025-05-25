import planApi from '@/api/planApi'
import type {
  CreatePlanReqDto,
  CreatePointReqDto,
  GetParticipantResDto,
  PlanNicknameReqDto,
  UpdateParticipantReqDto,
  UpdatePlanReqDto,
  UpdatePointReqDto,
} from '@/types/dto/plan'
import type {
  InviteCodeItem,
  InviteInfoItem,
  ParticipantItem,
  PlanItem,
  PointItem,
  VisibilityType,
} from '@/types/plan'
import { deserializeDate, getDateOnly, serializeDate } from '@/utils/date'

export const getPlan = async (planId: number) => {
  const response = await planApi.getPlan(planId)
  const data = response.data
  return {
    planId: data.planId,
    themeId: data.themeId,
    ownerId: data.ownerId,
    title: data.title,
    description: data.description,
    memo: data.memo,
    people: data.people,
    createdAt: data.createdAt ? deserializeDate(data.createdAt) : undefined,
    visibility: data.visibility,
    startDate: data.startDate ? deserializeDate(data.startDate) : undefined,
    endDate: data.endDate ? deserializeDate(data.endDate) : undefined,
  } as PlanItem
}

export const createPlan = (title: string, startDate: Date, endDate: Date) =>
  planApi.createPlan({
    title,
    startDate: serializeDate(startDate),
    endDate: serializeDate(endDate),
    themeId: 0,
  })

export const updatePlan = (
  planId: number,
  {
    themeId,
    title,
    description,
    memo,
    people,
    startDate,
    endDate,
    visibility,
  }: {
    themeId?: number
    title?: string
    description?: string
    memo?: string
    people?: number
    startDate?: Date
    endDate?: Date
    visibility?: VisibilityType
  },
) =>
  planApi
    .updatePlan(planId, {
      themeId,
      title,
      description,
      memo,
      people,
      startDate: startDate ? serializeDate(startDate) : undefined,
      endDate: endDate ? serializeDate(endDate) : undefined,
      visibility,
    } as UpdatePlanReqDto)
    .then((response) => response.data)

export const deletePlan = (planId: number) => planApi.deletePlan(planId)

export const getParticipants = async (planId: number) => {
  const response = await planApi.getParticipants(planId)
  const data = response.data
  return data.map((participant: GetParticipantResDto) => ({
    userId: participant.userId,
    nickname: participant.nickname,
    role: participant.role,
  })) as ParticipantItem[]
}

export const updateParticipant = (
  planId: number,
  userId: number,
  { role }: { role: 'owner' | 'member' },
) =>
  planApi
    .updateParticipant(planId, userId, { role } as UpdateParticipantReqDto)
    .then((response) => response.data)

export const deleteParticipant = (planId: number, userId: number) =>
  planApi.deleteParticipant(planId, userId)

export const getPoints = async (planId: number) => {
  const response = await planApi.getPoints(planId)
  const data = response.data
  return data.map((point) => ({
    pointId: point.pointId,
    startDate: deserializeDate(point.from),
    endDate: deserializeDate(point.to),
    attraction: point.attraction,
  })) as PointItem[]
}

export const addPoint = (
  planId: number,
  { attractionId, from, to }: { attractionId: number; from: Date; to: Date },
) =>
  planApi
    .addPoint(planId, {
      attractionId,
      from: serializeDate(from),
      to: serializeDate(to),
    } as CreatePointReqDto)
    .then((response) => response.data)

export const updatePoint = (
  planId: number,
  pointId: number,
  { from, to }: { from: Date; to: Date },
) =>
  planApi
    .updatePoint(planId, pointId, {
      from: serializeDate(from),
      to: serializeDate(to),
    } as UpdatePointReqDto)
    .then((response) => response.data)

export const deletePoint = (planId: number, pointId: number) => planApi.deletePoint(planId, pointId)

export const updateNickname = (
  planId: number,
  userId: number,
  { nickname }: { nickname: string },
) =>
  planApi
    .updateNickname(planId, userId, { nickname } as PlanNicknameReqDto)
    .then((response) => response.data)

export const createInviteCode = (planId: number) =>
  planApi.createInviteCode(planId).then<InviteCodeItem>((response) => ({
    inviteCode: response.data.inviteCode,
    validUntil: deserializeDate(response.data.validUntil),
  }))

export const getInviteInfo = (inviteCode: string) =>
  planApi.getInviteInfo(inviteCode).then<InviteInfoItem>((response) => ({
    nickname: response.data.nickname,
    title: response.data.title,
  }))

export const acceptInvite = (inviteCode: string) => planApi.acceptInvite(inviteCode)
