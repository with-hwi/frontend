export interface Pagination<T> {
  numOfRows: number
  pageNo: number
  totalCount: number
  items: T[]
}

export interface SidoItem {
  code: string
  name: string
}

export interface SigunguItem {
  code: string
  name: string
}

export interface AttractionItem {
  contentid: string
  title: string
  addr1?: string
  addr2?: string
  firstimage?: string
  tel?: string
  mapx?: string
  mapy?: string
}
