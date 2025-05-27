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
    await new Promise((resolve) => setTimeout(resolve, 2000))
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

const mockRecommendations = [...mockAttractions]
