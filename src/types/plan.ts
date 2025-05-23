import type { AttractionItem } from './tour'

export interface PlanItem {
  planId: number
  themeId: number
  ownerId: number
  title: string
  description: string
  memo: string
  people: number
  createdAt: Date
  visibility: VisibilityType
  startDate: Date
  endDate: Date
}

export interface ParticipantItem {
  userId: number
  nickname: string
  role: 'owner' | 'member'
}

export interface PointItem {
  pointId: number
  startDate: Date
  endDate: Date
  attraction: AttractionItem
}

export type VisibilityType = 'public' | 'private'

let attractionId = 0
export const mockAttractions = [
  {
    attractionId: attractionId++,
    address1: '서울특별시 강남구 언주로 608',
    address2: '',
    category1: 'A05',
    category2: 'A0502',
    category3: 'A05020100',
    contentId: '2871024',
    contentTypeId: '39',
    firstImageUrl: 'http://tong.visitkorea.or.kr/cms/resource/08/2871008_image2_1.JPG',
    firstImageThumbnailUrl: 'http://tong.visitkorea.or.kr/cms/resource/08/2871008_image3_1.JPG',
    longitude: '127.0377755568',
    latitude: '37.5099674377',
    telephone: '',
    title: '가나돈까스의집',
  },
  {
    attractionId: attractionId++,
    address1: '서울특별시 종로구 평창30길 28',
    address2: '(평창동)',
    category1: 'A02',
    category2: 'A0206',
    category3: 'A02060500',
    contentId: '129854',
    contentTypeId: '14',
    firstImageUrl: 'http://tong.visitkorea.or.kr/cms/resource/19/1570619_image2_1.jpg',
    firstImageThumbnailUrl: 'http://tong.visitkorea.or.kr/cms/resource/19/1570619_image3_1.jpg',
    longitude: '126.9751811398',
    latitude: '37.6122099878',
    telephone: '',
    title: '가나아트센터',
  },
  {
    attractionId: attractionId++,
    address1: '서울특별시 강남구 도산대로 113(신사동)',
    address2: '',
    category1: 'A04',
    category2: 'A0401',
    category3: 'A04011000',
    contentId: '2899721',
    contentTypeId: '38',
    firstImageUrl: 'http://tong.visitkorea.or.kr/cms/resource/58/2887858_image2_1.jpg',
    firstImageThumbnailUrl: 'http://tong.visitkorea.or.kr/cms/resource/58/2887858_image3_1.jpg',
    longitude: '127.0208657845',
    latitude: '37.5170635319',
    telephone: '',
    title: '가나안약국',
  },
  {
    attractionId: attractionId++,
    address1: '서울특별시 중구 남대문로 81',
    address2: '',
    category1: 'A04',
    category2: 'A0401',
    category3: 'A04011000',
    contentId: '2928947',
    contentTypeId: '38',
    firstImageUrl: 'http://tong.visitkorea.or.kr/cms/resource/11/2889211_image2_1.jpg',
    firstImageThumbnailUrl: 'http://tong.visitkorea.or.kr/cms/resource/11/2889211_image3_1.jpg',
    longitude: '126.9817485525',
    latitude: '37.5647822864',
    telephone: '',
    title: '가네시 롯데본점',
  },
  {
    attractionId: attractionId++,
    address1: '서울특별시 금천구 디지털로 185 (가산동)',
    address2: '',
    category1: 'A04',
    category2: 'A0401',
    category3: 'A04011000',
    contentId: '3306525',
    contentTypeId: '38',
    firstImageUrl: 'http://tong.visitkorea.or.kr/cms/resource/47/3314547_image2_1.jpg',
    firstImageThumbnailUrl: 'http://tong.visitkorea.or.kr/cms/resource/47/3314547_image3_1.jpg',
    longitude: '126.8872262708',
    latitude: '37.4782600918',
    telephone: '',
    title: '가넷옴므',
  },
  {
    attractionId: attractionId++,
    address1: '서울특별시 강남구 언주로167길 35',
    address2: '',
    category1: 'A05',
    category2: 'A0502',
    category3: 'A05020400',
    contentId: '2869760',
    contentTypeId: '39',
    firstImageUrl: 'http://tong.visitkorea.or.kr/cms/resource/54/2869754_image2_1.JPG',
    firstImageThumbnailUrl: 'http://tong.visitkorea.or.kr/cms/resource/54/2869754_image3_1.JPG',
    longitude: '127.0302729961',
    latitude: '37.5264209476',
    telephone: '',
    title: '가담',
  },
  {
    attractionId: attractionId++,
    address1: '서울특별시 송파구 충민로 66',
    address2: '',
    category1: 'A04',
    category2: 'A0401',
    category3: 'A04011200',
    contentId: '732484',
    contentTypeId: '38',
    firstImageUrl: 'http://tong.visitkorea.or.kr/cms/resource/78/1920578_image2_1.jpg',
    firstImageThumbnailUrl: 'http://tong.visitkorea.or.kr/cms/resource/78/1920578_image3_1.jpg',
    longitude: '127.1229354097',
    latitude: '37.4770061292',
    telephone: '',
    title: '가든파이브라이프(Garden5life)',
  },
  {
    attractionId: attractionId++,
    address1: '서울특별시 송파구 송이로19길 3',
    address2: '(가락동)',
    category1: 'A05',
    category2: 'A0502',
    category3: 'A05020100',
    contentId: '2757617',
    contentTypeId: '39',
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    longitude: '127.1217599348',
    latitude: '37.4975120620',
    telephone: '',
    title: '가락골마산아구찜',
  },
  {
    attractionId: attractionId++,
    address1: '서울특별시 송파구 송파대로28길 5',
    address2: '(가락동)',
    category1: 'B02',
    category2: 'B0201',
    category3: 'B02010100',
    contentId: '142785',
    contentTypeId: '32',
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    longitude: '127.1166298703',
    latitude: '37.4966565128',
    telephone: '02-400-6641~3',
    title: '가락관광호텔',
  },
  {
    attractionId: attractionId++,
    address1: '서울특별시 송파구 양재대로 932',
    address2: '(가락동)',
    category1: 'A04',
    category2: 'A0401',
    category3: 'A04010200',
    contentId: '132215',
    contentTypeId: '38',
    firstImageUrl: 'http://tong.visitkorea.or.kr/cms/resource/84/1920584_image2_1.jpg',
    firstImageThumbnailUrl: 'http://tong.visitkorea.or.kr/cms/resource/84/1920584_image3_1.jpg',
    longitude: '127.1109831778',
    latitude: '37.4960925880',
    telephone: '02-3435-1000',
    title: '가락농수산물종합도매시장',
  },
] as AttractionItem[]
