export interface Pagination<T> {
  size: number
  page: number
  totalElements: number
  content: T[]
  totalPages: number
}

export interface SidoItem {
  areaCode: string
  name: string
}

export interface SigunguItem {
  sigunguCode: string
  name: string
}

export interface AttractionItem {
  attractionId: number
  contentId: string
  title: string
  category1?: string
  category2?: string
  category3?: string
  contentTypeId?: string
  address1?: string
  address2?: string
  firstImageUrl?: string
  firstImageThumbnailUrl?: string
  telephone?: string
  longitude?: string
  latitude?: string
}

export type RecommendationItem = AttractionItem
