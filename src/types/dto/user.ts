import type { GetPlanResDto } from './plan'

export interface UserInfoDto {
  userId: number
  nickname: string
}

export interface UserProfileDto {
  nickname: string
  age: number
  sex?: 'M' | 'W'
}

export interface EditUserProfileDto {
  nickname?: string
  age?: number
  sex?: 'M' | 'W'
}

export type MyPlanDto = GetPlanResDto

export type MyJoinDto = GetPlanResDto

export type MyLikeDto = GetPlanResDto
