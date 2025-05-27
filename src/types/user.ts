import type { PlanItem } from './plan'

export interface UserInfo {
  userId: number
  nickname: string
}

export interface UserProfile {
  nickname: string
  age: number
  sex?: 'M' | 'W'
}

export type MyPlan = PlanItem

export type MyJoin = PlanItem

export type MyLike = PlanItem
