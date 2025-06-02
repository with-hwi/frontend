// src/mocks/handlers.ts
import { API_BASE_URL } from '@/constants/urls'
import type {
  UpdatePlanReqDto,
  CreatePointResDto,
  UpdatePlanResDto,
  GetPlanResDto,
  GetPointsResDto,
  CreatePointReqDto,
  UpdateParticipantResDto,
  UpdateParticipantReqDto,
  PlanNicknameReqDto,
  PlanNicknameResDto,
  CreatePlanReqDto,
  CreatePlanResDto,
  AcceptInviteReqDto,
} from '@/types/dto/plan'
import type { InviteInfoItem, PlanItem, PointItem } from '@/types/plan'
import type { AttractionItem } from '@/types/tour'
import { deserializeDate, serializeDate } from '@/utils/date'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/example', () => {
    return HttpResponse.json({ message: 'Hello World!' })
  }),

  http.post(`*/api/v1/plans`, async ({ request }) => {
    const body = (await request.json()) as CreatePlanReqDto
    return HttpResponse.json<CreatePlanResDto>({
      planId: 10,
      title: body.title,
      createdAt: serializeDate(new Date()),
    })
  }),

  http.get(`*/api/v1/plans/join`, ({ request }) => {
    const url = new URL(request.url)
    return HttpResponse.json<InviteInfoItem>({
      nickname: '꿈꾸는 라이언',
      title: '제주도 무계획 여행',
    })
  }),

  http.post(`*/api/v1/plans/join`, async ({ request }) => {
    const body = (await request.json()) as AcceptInviteReqDto
    return HttpResponse.json()
  }),

  http.get(`*/api/v1/plans/:planId`, ({ params }) => {
    const planId = Number(params.planId)
    return HttpResponse.json({
      planId: planId,
      themeId: 0,
      ownerId: 1,
      title: '',
      description: '',
      memo: '',
      people: 1,
      createdAt: new Date(),
      visibility: 'hidden',
      startDate: new Date(),
      endDate: new Date(),
    } as PlanItem)
  }),

  http.patch(`*/api/v1/plans/:planId`, async ({ params, request }) => {
    const planId = Number(params.planId)

    const body = (await request.json()) as UpdatePlanReqDto
    const response = { planId } as UpdatePlanResDto

    for (const key of Object.keys(body)) {
      const typedKey = key as keyof typeof body
      const value = body[typedKey]
      if (value === undefined) {
        continue
      }

      if (typedKey == 'people') {
        console.log('people', value)
      }
      if (typeof value === 'string' && value.length > 30) {
        return HttpResponse.json({ message: '테스트 중에는 30자 초과 금지' }, { status: 400 })
      }
      ;(response[typedKey] as any) = value
    }

    // body에서 undefined가 아닌 값만 response에 추가
    for (const key of Object.keys(body)) {
      const typedKey = key as keyof typeof body
      const value = body[typedKey]
      if (value !== undefined) {
        ;(response[typedKey] as any) = value
      }
    }
    return HttpResponse.json({ message: 'Plan updated' })
  }),

  http.get(`*/api/v1/users/profile`, () => {
    return HttpResponse.json({
      nickname: '김영규',
      userId: 1,
    })
  }),

  http.get(`*/api/v1/users/profile`, () => {
    return HttpResponse.json({
      nickname: '김영규',
      userId: 1,
      age: 20,
    })
  }),

  http.put(`*/api/v1/users/profile`, () => {
    return HttpResponse.json()
  }),

  http.get(`*/api/v1/users/my-plans`, () => {
    return HttpResponse.json<GetPlanResDto[]>([...mockPlans])
  }),

  http.get(`*/api/v1/users/my-joins`, () => {
    return HttpResponse.json<GetPlanResDto[]>([...mockPlans])
  }),

  http.get(`*/api/v1/users/likes`, () => {
    return HttpResponse.json<GetPlanResDto[]>([...mockPlans])
  }),

  http.get(`*/api/v1/attractions/areas`, ({ request }) => {
    const url = new URL(request.url)
    const areaCode = url.searchParams.get('areaCode')
    if (!areaCode) {
      return HttpResponse.json([{ areaCode: 1, name: '서울' }])
    } else {
      return HttpResponse.json([{ areaCode: 1, sigunguCode: 1, name: '경기도' }])
    }
  }),

  http.get(`*/api/v1/attractions`, () => {
    return HttpResponse.json({
      content: mockAttractions,
      size: 10,
      page: 1,
      totalElements: 10,
      totalPages: 1,
    })
  }),

  http.get(`*/api/v1/plans/:planId/participants`, () => {
    return HttpResponse.json([
      { userId: 1, nickname: '김영규', role: 'owner' },
      { userId: 2, nickname: '김여행', role: 'owner' },
      { userId: 3, nickname: '박모험', role: 'member' },
      { userId: 4, nickname: '이탐험', role: 'owner' },
      { userId: 5, nickname: '최여정', role: 'member' },
    ])
  }),

  http.patch(`*/api/v1/plans/:planId/participants/:userId`, async ({ params, request }) => {
    const planId = Number(params.planId)
    const userId = Number(params.userId)
    const body = (await request.json()) as UpdateParticipantReqDto
    return HttpResponse.json({ userId, role: body.role } as UpdateParticipantResDto)
  }),

  http.delete(`*/api/v1/plans/:planId/participants/:userId`, async ({ params, request }) => {
    return HttpResponse.json()
  }),

  http.put(`*/api/v1/plans/:planId/nickname/:userId`, async ({ params, request }) => {
    const planId = Number(params.planId)
    const userId = Number(params.userId)
    const body = (await request.json()) as PlanNicknameReqDto
    return HttpResponse.json({ userId, nickname: body.nickname } as PlanNicknameResDto)
  }),

  http.post(`*/api/v1/plans/:planId/invite`, () => {
    return HttpResponse.json({
      inviteCode: '123456',
      validUntil: '2025-06-27 10:00:00',
    })
  }),

  http.get(`*/api/v1/plans/:planId/points`, () => {
    return HttpResponse.json(mockGetPointDtos)
  }),

  http.post(`*/api/v1/plans/:planId/points`, async ({ request }) => {
    const body = (await request.json()) as CreatePointReqDto
    const response = {
      pointId: Math.floor(Math.random() * 1000000),
      ...body,
    } as CreatePointResDto

    return HttpResponse.json(response)
  }),

  http.patch(`*/api/v1/plans/:planId/points/:pointId`, () => {
    return HttpResponse.json()
  }),

  http.delete(`*/api/v1/plans/:planId/points/:pointId`, () => {
    return HttpResponse.json()
  }),

  http.get('/error', () => {
    return HttpResponse.json(
      {
        message: 'error',
      },
      {
        status: 401,
      },
    )
  }),

  http.get(`*/api/v1/plans/:planId/recommendation`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return HttpResponse.json(mockRecommendations)
  }),

  http.get(`${API_BASE_URL}/needAuth`, () => {
    return HttpResponse.json(
      {
        message: 'needAuth',
      },
      {
        status: 401,
      },
    )
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/refresh`, () => {
    return HttpResponse.json(
      {
        message: 'refresh',
      },
      {
        status: 401,
      },
    )
  }),

  http.get(`*/redirect`, () => {
    return HttpResponse.json(
      {
        message: 'redir',
      },
      {
        status: 302,
        headers: {
          Location: '/',
        },
      },
    )
  }),
]

let attractionId = 0
const mockAttractions = [
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

let pointId = 0
const mockPoints: PointItem[] = [
  {
    pointId: pointId++,
    startDate: deserializeDate('2025-05-10 16:00:00'),
    endDate: deserializeDate('2025-05-10 16:10:00'),
    attraction: mockAttractions[0],
  },
  {
    pointId: pointId++,
    startDate: deserializeDate('2025-05-10 16:30:00'),
    endDate: deserializeDate('2025-05-10 16:40:00'),
    attraction: mockAttractions[1],
  },
  {
    pointId: pointId++,
    startDate: deserializeDate('2025-05-10 17:00:00'),
    endDate: deserializeDate('2025-05-10 17:10:00'),
    attraction: mockAttractions[2],
  },
  {
    pointId: pointId++,
    startDate: deserializeDate('2025-05-11 17:30:00'),
    endDate: deserializeDate('2025-05-11 17:40:00'),
    attraction: mockAttractions[3],
  },
  {
    pointId: pointId++,
    startDate: deserializeDate('2025-05-12 18:00:00'),
    endDate: deserializeDate('2025-05-12 18:10:00'),
    attraction: mockAttractions[4],
  },
  {
    pointId: pointId++,
    startDate: deserializeDate('2025-05-12 18:30:00'),
    endDate: deserializeDate('2025-05-12 18:40:00'),
    attraction: mockAttractions[5],
  },
]

const mockGetPointDtos = [
  {
    pointId: pointId++,
    from: '2025-05-10 16:00:00',
    to: '2025-05-10 16:10:00',
    attraction: mockAttractions[0],
  },
  {
    pointId: pointId++,
    from: '2025-05-10 16:30:00',
    to: '2025-05-10 16:40:00',
    attraction: mockAttractions[1],
  },
  {
    pointId: pointId++,
    from: '2025-05-10 17:00:00',
    to: '2025-05-10 17:10:00',
    attraction: mockAttractions[2],
  },
  {
    pointId: pointId++,
    from: '2025-05-11 17:30:00',
    to: '2025-05-11 17:40:00',
    attraction: mockAttractions[3],
  },
  {
    pointId: pointId++,
    from: '2025-05-12 18:00:00',
    to: '2025-05-12 18:10:00',
    attraction: mockAttractions[4],
  },
  {
    pointId: pointId++,
    from: '2025-05-12 18:30:00',
    to: '2025-05-12 18:40:00',
    attraction: mockAttractions[5],
  },
] as GetPointsResDto[]

const mockPlans: GetPlanResDto[] = [
  {
    planId: 1,
    themeId: 123,
    ownerId: 3,
    ownerNickname: '김영규',
    title: '서울여행',
    description: '서울 여행입니다',
    memo: '메모입니다',
    createdAt: '2025-05-22 11:17:49',
    startDate: '2025-05-23 11:23:15',
    endDate: '2025-05-26 11:23:15',
    visibility: 'open',
    people: 1,
  },
  {
    planId: 26,
    themeId: 1,
    ownerId: 3,
    ownerNickname: '김영규',
    title: 'sdlfjkasdf',
    description: '',
    memo: '',
    createdAt: '2025-05-26 21:46:08',
    startDate: '2025-05-26 21:43:19',
    endDate: '2025-06-02 21:43:19',
    visibility: 'hidden',
    people: 1,
  },
  {
    planId: 27,
    themeId: 0,
    ownerId: 3,
    ownerNickname: '김영규',
    title: 'l;k;lkjl',
    description: '',
    memo: '',
    createdAt: '2025-05-26 21:49:48',
    startDate: '2025-05-26 21:49:42',
    endDate: '2025-06-02 21:49:42',
    visibility: 'hidden',
    people: 1,
  },
  {
    planId: 28,
    themeId: 0,
    ownerId: 3,
    ownerNickname: '김영규',
    title: 'l;k;lkjl;l',
    description: '',
    memo: '',
    createdAt: '2025-05-26 21:50:00',
    startDate: '2025-05-26 21:49:42',
    endDate: '2025-06-02 21:49:42',
    visibility: 'hidden',
    people: 1,
  },
  {
    planId: 29,
    themeId: 0,
    ownerId: 3,
    ownerNickname: '김영규',
    title: 'ㅁㄴㅇㄹ',
    description: '',
    memo: '',
    createdAt: '2025-05-26 21:50:11',
    startDate: '2025-05-26 21:50:07',
    endDate: '2025-06-02 21:50:07',
    visibility: 'hidden',
    people: 1,
  },
  {
    planId: 30,
    themeId: 0,
    ownerId: 3,
    ownerNickname: '김영규',
    title: '오늘의 플랜',
    description: '',
    memo: '',
    createdAt: '2025-05-27 04:22:13',
    startDate: '2025-05-27 13:22:09',
    endDate: '2025-06-03 13:22:09',
    visibility: 'hidden',
    people: 1,
  },
  {
    planId: 31,
    themeId: 5,
    ownerId: 3,
    ownerNickname: '김영규',
    title: '플랜 제목',
    description: '간단한 설명',
    memo: 'ㄴㅁㅇㄹㄴㄴㅇㄹㄴㅇㄹㄴㅇㄹㄴㅇㄹㅁㅇㄹ',
    createdAt: '2025-05-27 04:23:05',
    startDate: '2025-05-27 13:22:54',
    endDate: '2025-06-03 13:22:54',
    visibility: 'hidden',
    people: 1,
  },
  {
    planId: 32,
    themeId: 3,
    ownerId: 3,
    ownerNickname: '김영규',
    title: '야호',
    description: '야호호호',
    memo: "asdfasdflk';lk\n;lk\n\n;kjl;kj",
    createdAt: '2025-05-27 04:33:24',
    startDate: '2025-05-27 13:33:20',
    endDate: '2025-06-03 13:33:20',
    visibility: 'hidden',
    people: 1,
  },
  {
    planId: 33,
    themeId: 0,
    ownerId: 3,
    ownerNickname: '김영규',
    title: 'asdfasdf',
    description: 'fwer',
    memo: '',
    createdAt: '2025-05-27 04:50:30',
    startDate: '2025-05-27 13:50:28',
    endDate: '2025-06-03 13:50:28',
    visibility: 'hidden',
    people: 1,
  },
  {
    planId: 34,
    themeId: 5,
    ownerId: 3,
    ownerNickname: '김영규',
    title: 'sdfasdlfk;j;l',
    description: 'asfasfdasdfasfdasdfsafdfdsa',
    memo: '메모!',
    createdAt: '2025-05-27 05:26:28',
    startDate: '2025-05-27 14:26:24',
    endDate: '2025-06-03 14:26:24',
    visibility: 'hidden',
    people: 1,
  },
]

const mockRecommendations = [
  {
    attractionId: 51059,
    contentId: '18514310',
    contentTypeId: '',
    title: '제주도',
    createdTime: [2025, 5, 26, 19, 43, 27],
    modifiedTime: [2025, 5, 26, 19, 43, 27],
    telephone: '',
    address1: '제주특별자치도 제주시 오등동 산 182',
    address2: '',
    zipCode: '',
    category1: '',
    category2: '',
    category3: '',
    latitude: 33.37977782,
    longitude: 126.54587356,
    mapLevel: -1,
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    copyrightDivisionCode: '',
    booktourInfo: '',
    sigunguCode: 0,
    sigunguName: null,
    areaCode: 0,
    areaName: null,
    source: 'kakao',
  },
  {
    attractionId: 51060,
    contentId: '8179010',
    contentTypeId: '',
    title: '동궁과월지',
    createdTime: [2025, 5, 26, 19, 43, 27],
    modifiedTime: [2025, 5, 26, 19, 43, 27],
    telephone: '054-750-8655',
    address1: '경북 경주시 인왕동 506-1',
    address2: '경북 경주시 원화로 102',
    zipCode: '',
    category1: '',
    category2: '',
    category3: '',
    latitude: 35.83477626,
    longitude: 129.22697552,
    mapLevel: -1,
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    copyrightDivisionCode: '',
    booktourInfo: '',
    sigunguCode: 0,
    sigunguName: null,
    areaCode: 0,
    areaName: null,
    source: 'kakao',
  },
  {
    attractionId: 51062,
    contentId: '10188423',
    contentTypeId: '',
    title: '국립남해편백자연휴양림',
    createdTime: [2025, 5, 26, 19, 43, 28],
    modifiedTime: [2025, 5, 26, 19, 43, 28],
    telephone: '055-867-7881',
    address1: '경남 남해군 삼동면 봉화리 산 553-1',
    address2: '경남 남해군 삼동면 금암로 658',
    zipCode: '',
    category1: '',
    category2: '',
    category3: '',
    latitude: 34.75185786,
    longitude: 128.01965164,
    mapLevel: -1,
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    copyrightDivisionCode: '',
    booktourInfo: '',
    sigunguCode: 0,
    sigunguName: null,
    areaCode: 0,
    areaName: null,
    source: 'kakao',
  },
  {
    attractionId: 51061,
    contentId: '8199114',
    contentTypeId: '',
    title: '경포해수욕장',
    createdTime: [2025, 5, 26, 19, 43, 27],
    modifiedTime: [2025, 5, 26, 19, 43, 27],
    telephone: '',
    address1: '강원특별자치도 강릉시 강문동 산 1',
    address2: '강원특별자치도 강릉시 창해로 514',
    zipCode: '',
    category1: '',
    category2: '',
    category3: '',
    latitude: 37.80340551,
    longitude: 128.91021025,
    mapLevel: -1,
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    copyrightDivisionCode: '',
    booktourInfo: '',
    sigunguCode: 0,
    sigunguName: null,
    areaCode: 0,
    areaName: null,
    source: 'kakao',
  },
  {
    attractionId: 51075,
    contentId: '26968788',
    contentTypeId: '',
    title: '보성차밭전망대',
    createdTime: [2025, 5, 26, 20, 5, 31],
    modifiedTime: [2025, 5, 26, 20, 5, 31],
    telephone: '',
    address1: '전남 보성군 회천면 영천리 11-3',
    address2: '',
    zipCode: '',
    category1: '',
    category2: '',
    category3: '',
    latitude: 34.70686659,
    longitude: 127.09040247,
    mapLevel: -1,
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    copyrightDivisionCode: '',
    booktourInfo: '',
    sigunguCode: 0,
    sigunguName: null,
    areaCode: 0,
    areaName: null,
    source: 'kakao',
  },
  {
    attractionId: 51067,
    contentId: '11657791',
    contentTypeId: '',
    title: '통영케이블카',
    createdTime: [2025, 5, 26, 19, 43, 41],
    modifiedTime: [2025, 5, 26, 19, 43, 41],
    telephone: '1544-3303',
    address1: '경남 통영시 도남동 349-1',
    address2: '경남 통영시 발개로 205',
    zipCode: '',
    category1: '',
    category2: '',
    category3: '',
    latitude: 34.82678774,
    longitude: 128.42620793,
    mapLevel: -1,
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    copyrightDivisionCode: '',
    booktourInfo: '',
    sigunguCode: 0,
    sigunguName: null,
    areaCode: 0,
    areaName: null,
    source: 'kakao',
  },
  {
    attractionId: 51082,
    contentId: '10482115',
    contentTypeId: '',
    title: '설악워터피아',
    createdTime: [2025, 5, 27, 7, 6, 40],
    modifiedTime: [2025, 5, 27, 7, 6, 40],
    telephone: '033-630-5800',
    address1: '강원특별자치도 속초시 장사동 24-9',
    address2: '강원특별자치도 속초시 미시령로2983번길 88',
    zipCode: '',
    category1: '',
    category2: '',
    category3: '',
    latitude: 38.2080673,
    longitude: 128.52753318,
    mapLevel: -1,
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    copyrightDivisionCode: '',
    booktourInfo: '',
    sigunguCode: 0,
    sigunguName: null,
    areaCode: 0,
    areaName: null,
    source: 'kakao',
  },
  {
    attractionId: 51074,
    contentId: '1576142949',
    contentTypeId: '',
    title: '유월드루지테마파크',
    createdTime: [2025, 5, 26, 20, 4, 55],
    modifiedTime: [2025, 5, 26, 20, 4, 55],
    telephone: '061-810-6000',
    address1: '전남 여수시 소라면 죽림리 116',
    address2: '전남 여수시 소라면 안심산길 155',
    zipCode: '',
    category1: '',
    category2: '',
    category3: '',
    latitude: 34.74791124,
    longitude: 127.64145821,
    mapLevel: -1,
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    copyrightDivisionCode: '',
    booktourInfo: '',
    sigunguCode: 0,
    sigunguName: null,
    areaCode: 0,
    areaName: null,
    source: 'kakao',
  },
  {
    attractionId: 51077,
    contentId: '17985162',
    contentTypeId: '',
    title: '수원화성',
    createdTime: [2025, 5, 26, 20, 6, 15],
    modifiedTime: [2025, 5, 26, 20, 6, 15],
    telephone: '031-290-3600',
    address1: '경기 수원시 장안구 영화동 320-2',
    address2: '',
    zipCode: '',
    category1: '',
    category2: '',
    category3: '',
    latitude: 37.28695696,
    longitude: 127.01179574,
    mapLevel: -1,
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    copyrightDivisionCode: '',
    booktourInfo: '',
    sigunguCode: 0,
    sigunguName: null,
    areaCode: 0,
    areaName: null,
    source: 'kakao',
  },
  {
    attractionId: 51100,
    contentId: '7999903',
    contentTypeId: '',
    title: '영금정',
    createdTime: [2025, 5, 27, 7, 7, 31],
    modifiedTime: [2025, 5, 27, 7, 7, 31],
    telephone: '033-633-3171',
    address1: '강원특별자치도 속초시 동명동 1-185',
    address2: '',
    zipCode: '',
    category1: '',
    category2: '',
    category3: '',
    latitude: 38.21180585,
    longitude: 128.60158579,
    mapLevel: -1,
    firstImageUrl: '',
    firstImageThumbnailUrl: '',
    copyrightDivisionCode: '',
    booktourInfo: '',
    sigunguCode: 0,
    sigunguName: null,
    areaCode: 0,
    areaName: null,
    source: 'kakao',
  },
]
