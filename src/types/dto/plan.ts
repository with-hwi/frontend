import type { VisibilityType } from '../plan'
import type { AttractionItem } from '../tour'

export interface GetPlanResDto {
  planId: number
  themeId?: number
  ownerId?: number
  title?: string
  description?: string
  memo?: string
  people?: number
  createdAt?: string
  visibility?: VisibilityType
  startDate?: string
  endDate?: string
}

export interface CreatePlanReqDto {
  title: string
}

export interface CreatePlanResDto {
  planId: number
  title: string
  createdAt: string
}

export interface UpdatePlanReqDto {
  themeId?: number
  title?: string
  description?: string
  memo?: string
  people?: number
  visibility?: VisibilityType
  startDate?: string
  endDate?: string
}

export interface UpdatePlanResDto {
  planId: number
  themeId?: number
  title?: string
  description?: string
  memo?: string
  people?: number
  visibility?: VisibilityType
  startDate?: string
  endDate?: string
}

export interface GetParticipantResDto {
  userId: number
  nickname: string
  role: 'owner' | 'member'
}

export interface UpdateParticipantReqDto {
  role: 'owner' | 'member'
}

export interface UpdateParticipantResDto {
  userId: number
  role: 'owner' | 'member'
}

export interface GetPointsResDto {
  pointId: number
  from: string
  to: string
  attraction: AttractionItem // TODO: 추후 AttractionDto로 변경
}
;[]

export interface CreatePointReqDto {
  attractionId: number
  from: string
  to: string
}

export interface CreatePointResDto {
  pointId: number
  attractionId: number
  from: string
  to: string
}

export interface UpdatePointReqDto {
  from: string
  to: string
}

export interface UpdatePointResDto {
  pointId: number
  from: string
  to: string
}

export interface PlanNicknameReqDto {
  nickname: string
}

export interface PlanNicknameResDto {
  userId: number
  nickname: string
}

/*
{
”planId”:123,
”themeId”: “123”,
”ownerId”: 123,
”ownerNickname”: “ssafy”,
”title”: “서울여행”,
”description”: “서울 여행입니다”,
”memo”: “메모입니다”,
”people”: 10,
”createdAt”: “날짜”,
”startDate”: “출발 날짜”,
”endDate”: “끝나는 날짜”,
”visibility”: “public | private”
”participants”: [
  {
  “userId”: 123,
  “nickname”: “행복한 라이언”,
  “role”: “owner | member”,
  },
  // ….
],
”points”: [
  // 여행지 검색 결과 DTO와 동일하되, order 도 함께.
]
}

*/
