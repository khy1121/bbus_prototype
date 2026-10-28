// TODO(backend): 서버 연동 후 삭제 — 개발용 목업 데이터
import baengnoju from './assets/places/baengnoju.webp'
import banpo from './assets/places/banpo.webp'
import bukhanCafe from './assets/places/bukhan-cafe.webp'
import cheongpyeong from './assets/places/cheongpyeong.webp'
import dumulmeori from './assets/places/dumulmeori.webp'
import eulwang from './assets/places/eulwang.webp'
import heonhwa from './assets/places/heonhwa.webp'
import heyri from './assets/places/heyri.webp'
import jaraseom from './assets/places/jaraseom.webp'
import mongsanpo from './assets/places/mongsanpo.webp'
import namsan from './assets/places/namsan.webp'
import oidoThumb from './assets/places/oido.webp'
import sanjeong from './assets/places/sanjeong.webp'
import seojong from './assets/places/seojong.webp'
import songdo from './assets/places/songdo.webp'
import hero from './assets/hero.webp'
import thumb2 from './assets/thumb2.webp'
import thumb3 from './assets/thumb3.webp'
import type { Category, CategoryId, DriveConditions, HomeNotification, PlaceDetail } from './types'

export const CATEGORIES: Category[] = [
  { id: 'sea', label: '바다' },
  { id: 'night', label: '야경' },
  { id: 'cafe', label: '근교 카페' },
  { id: 'nature', label: '자연' },
  { id: 'camp', label: '차박' },
]

const CATEGORY_LABEL: Record<CategoryId, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<
  CategoryId,
  string
>

/** 현재 위치 (목업: 서울 서초구) */
export const MOCK_CURRENT_POSITION = { lat: 37.4837, lng: 127.0324 }

type Seed = {
  id: string
  name: string
  region: string
  duration: string
  category: CategoryId
  photo: string
  tags: string[]
  lat: number
  lng: number
  route: string
}

const SEEDS: Seed[] = [
  // 바다
  { id: 'oido', name: '시흥 오이도', region: '경기 시흥시', duration: '약 1시간', category: 'sea', photo: oidoThumb, tags: ['일몰', '해안도로', '드라이브코스'], lat: 37.3459, lng: 126.6876, route: '서해안\n고속도로' },
  { id: 'heonhwa', name: '강릉 헌화로', region: '강원 강릉시', duration: '약 3시간', category: 'sea', photo: heonhwa, tags: ['바다', '해안도로'], lat: 37.7, lng: 129.0, route: '영동\n고속도로' },
  { id: 'eulwang', name: '인천 을왕리 해수욕장', region: '인천 중구', duration: '약 1시간 10분', category: 'sea', photo: eulwang, tags: ['바다', '노을'], lat: 37.4474, lng: 126.3725, route: '인천공항\n고속도로' },
  { id: 'jebudo', name: '화성 제부도', region: '경기 화성시', duration: '약 1시간 20분', category: 'sea', photo: oidoThumb, tags: ['바닷길', '일몰'], lat: 37.1667, lng: 126.6244, route: '서해안\n고속도로' },
  { id: 'daebudo', name: '안산 대부도', region: '경기 안산시', duration: '약 1시간 10분', category: 'sea', photo: eulwang, tags: ['노을', '방조제'], lat: 37.2475, lng: 126.5785, route: '시화방조제' },
  { id: 'sokcho', name: '속초 해변', region: '강원 속초시', duration: '약 2시간 40분', category: 'sea', photo: heonhwa, tags: ['동해', '바다'], lat: 38.19, lng: 128.6, route: '서울양양\n고속도로' },
  { id: 'wangsan', name: '인천 왕산 마리나', region: '인천 중구', duration: '약 1시간 10분', category: 'sea', photo: eulwang, tags: ['요트', '바다'], lat: 37.45, lng: 126.37, route: '인천공항\n고속도로' },
  // 야경
  { id: 'namsan', name: '서울 남산 순환도로', region: '서울 중구', duration: '약 20분', category: 'night', photo: namsan, tags: ['도심드라이브', '서울'], lat: 37.5512, lng: 126.9882, route: '남산\n순환로' },
  { id: 'banpo', name: '서울 반포한강공원', region: '서울 서초구', duration: '약 30분', category: 'night', photo: banpo, tags: ['한강', '데이트'], lat: 37.5108, lng: 126.9961, route: '올림픽대로' },
  { id: 'songdo', name: '인천 송도 센트럴파크', region: '인천 연수구', duration: '약 1시간', category: 'night', photo: songdo, tags: ['야경', '도시전망'], lat: 37.3925, lng: 126.6386, route: '제2경인\n고속도로' },
  { id: 'bukak', name: '서울 북악 스카이웨이', region: '서울 종로구', duration: '약 40분', category: 'night', photo: namsan, tags: ['야경', '드라이브코스'], lat: 37.6, lng: 126.98, route: '북악\n스카이웨이' },
  { id: 'jamsu', name: '서울 잠수교', region: '서울 용산구', duration: '약 25분', category: 'night', photo: banpo, tags: ['분수', '한강'], lat: 37.5133, lng: 126.995, route: '강변북로' },
  { id: 'wolmido', name: '인천 월미도', region: '인천 중구', duration: '약 1시간', category: 'night', photo: songdo, tags: ['야경', '바다'], lat: 37.4754, lng: 126.5966, route: '경인\n고속도로' },
  { id: 'haneul', name: '서울 하늘공원', region: '서울 마포구', duration: '약 40분', category: 'night', photo: namsan, tags: ['노을', '야경'], lat: 37.5683, lng: 126.885, route: '강변북로' },
  // 근교 카페
  { id: 'bukhan-cafe', name: '남양주 북한강 카페거리', region: '경기 남양주시', duration: '약 50분', category: 'cafe', photo: bukhanCafe, tags: ['리버뷰', '카페투어'], lat: 37.59, lng: 127.33, route: '경춘로' },
  { id: 'heyri', name: '파주 헤이리 예술마을', region: '경기 파주시', duration: '약 1시간', category: 'cafe', photo: heyri, tags: ['감성카페', '데이트'], lat: 37.7899, lng: 126.6955, route: '자유로' },
  { id: 'seojong', name: '양평 서종 카페거리', region: '경기 양평군', duration: '약 1시간', category: 'cafe', photo: seojong, tags: ['자연뷰', '힐링'], lat: 37.6, lng: 127.37, route: '서울양양\n고속도로' },
  { id: 'gimpo-cafe', name: '김포 대명항 카페', region: '경기 김포시', duration: '약 1시간', category: 'cafe', photo: heyri, tags: ['오션뷰', '카페'], lat: 37.65, lng: 126.53, route: '김포\n한강로' },
  { id: 'gwangju-cafe', name: '광주 남한산성 카페', region: '경기 광주시', duration: '약 40분', category: 'cafe', photo: bukhanCafe, tags: ['산뷰', '카페투어'], lat: 37.48, lng: 127.18, route: '중부\n고속도로' },
  { id: 'paju-cafe', name: '파주 출판도시 카페', region: '경기 파주시', duration: '약 1시간', category: 'cafe', photo: seojong, tags: ['북카페', '데이트'], lat: 37.71, lng: 126.68, route: '자유로' },
  { id: 'yangju-cafe', name: '양주 장흥 카페거리', region: '경기 양주시', duration: '약 1시간', category: 'cafe', photo: heyri, tags: ['숲뷰', '힐링'], lat: 37.72, lng: 126.95, route: '세종포천\n고속도로' },
  // 자연
  { id: 'dumulmeori', name: '양평 두물머리', region: '경기 양평군', duration: '약 1시간', category: 'nature', photo: dumulmeori, tags: ['자연', '강변'], lat: 37.5296, lng: 127.3143, route: '서울양양\n고속도로' },
  { id: 'cheongpyeong', name: '가평 청평호반', region: '경기 가평군', duration: '약 1시간', category: 'nature', photo: cheongpyeong, tags: ['호수', '자연 풍경'], lat: 37.72, lng: 127.43, route: '경춘로' },
  { id: 'sanjeong', name: '포천 산정호수', region: '경기 포천시', duration: '약 2시간', category: 'nature', photo: sanjeong, tags: ['호수', '숲길'], lat: 38.0706, lng: 127.3125, route: '세종포천\n고속도로' },
  { id: 'achim', name: '가평 아침고요수목원', region: '경기 가평군', duration: '약 1시간 30분', category: 'nature', photo: cheongpyeong, tags: ['수목원', '산책'], lat: 37.743, lng: 127.352, route: '경춘로' },
  { id: 'semiwon', name: '양평 세미원', region: '경기 양평군', duration: '약 1시간', category: 'nature', photo: dumulmeori, tags: ['연꽃', '정원'], lat: 37.535, lng: 127.317, route: '서울양양\n고속도로' },
  { id: 'hwadam', name: '광주 화담숲', region: '경기 광주시', duration: '약 50분', category: 'nature', photo: sanjeong, tags: ['단풍', '숲길'], lat: 37.4, lng: 127.29, route: '제2중부\n고속도로' },
  { id: 'byeokcho', name: '파주 벽초지수목원', region: '경기 파주시', duration: '약 1시간 10분', category: 'nature', photo: cheongpyeong, tags: ['정원', '산책'], lat: 37.84, lng: 126.83, route: '자유로' },
  // 차박
  { id: 'mongsanpo', name: '태안 몽산포 캠핑장', region: '충남 태안군', duration: '약 3시간', category: 'camp', photo: mongsanpo, tags: ['차박', '바다'], lat: 36.68, lng: 126.28, route: '서해안\n고속도로' },
  { id: 'jaraseom', name: '가평 자라섬 캠핑장', region: '경기 가평군', duration: '약 1시간', category: 'camp', photo: jaraseom, tags: ['차박', '캠핑'], lat: 37.82, lng: 127.52, route: '경춘로' },
  { id: 'baengnoju', name: '포천 백로주 캠핑장', region: '경기 포천시', duration: '약 2시간', category: 'camp', photo: baengnoju, tags: ['차박', '힐링'], lat: 38.0, lng: 127.25, route: '세종포천\n고속도로' },
  { id: 'hantan', name: '연천 한탄강 캠핑장', region: '경기 연천군', duration: '약 1시간 40분', category: 'camp', photo: baengnoju, tags: ['차박', '강변'], lat: 38.03, lng: 127.07, route: '세종포천\n고속도로' },
  { id: 'nanji', name: '서울 난지 캠핑장', region: '서울 마포구', duration: '약 40분', category: 'camp', photo: jaraseom, tags: ['도심캠핑', '한강'], lat: 37.5665, lng: 126.8767, route: '강변북로' },
  { id: 'wando', name: '화성 궁평항 차박지', region: '경기 화성시', duration: '약 1시간 30분', category: 'camp', photo: mongsanpo, tags: ['차박', '노을'], lat: 37.11, lng: 126.68, route: '서해안\n고속도로' },
  { id: 'yuldong', name: '홍천 율동 차박지', region: '강원 홍천군', duration: '약 1시간 50분', category: 'camp', photo: baengnoju, tags: ['차박', '별보기'], lat: 37.69, lng: 127.88, route: '서울양양\n고속도로' },
]

function toDetail(s: Seed): PlaceDetail {
  const isOido = s.id === 'oido'
  return {
    id: s.id,
    name: s.name,
    region: s.region,
    duration: s.duration,
    thumbnail: s.photo,
    hashtags: s.tags,
    category: s.category,
    address: s.region,
    intro: isOido
      ? '연인과 함께 서해 바다를 따라 달리며 낭만적인 시간을 보내보세요. 붉은 등대와 아름다운 노을이 어우러진 오이도에서 둘만의 특별한 추억을 만들 수 있어요.'
      : `${s.name}에서 연인과 함께 ${CATEGORY_LABEL[s.category]} 드라이브를 즐겨보세요. 둘만의 특별한 추억을 만들 수 있어요.`,
    photos: isOido ? [hero, thumb2, thumb3, oidoThumb, eulwang, heonhwa, banpo, songdo] : [s.photo, thumb2, thumb3],
    summary: {
      duration: s.duration,
      mainRoute: s.route,
      parking: '공영주차장\n이용 가능',
      visitTime: s.category === 'night' ? '오후 7-10시' : '오후 5-8시',
      visitTimeNote: s.category === 'night' ? '(야경 시간대)' : '(일몰 시간대)',
    },
    position: { lat: s.lat, lng: s.lng },
    waypoints: [
      {
        lat: MOCK_CURRENT_POSITION.lat + (s.lat - MOCK_CURRENT_POSITION.lat) * 0.35,
        lng: MOCK_CURRENT_POSITION.lng + (s.lng - MOCK_CURRENT_POSITION.lng) * 0.3,
      },
      {
        lat: MOCK_CURRENT_POSITION.lat + (s.lat - MOCK_CURRENT_POSITION.lat) * 0.7,
        lng: MOCK_CURRENT_POSITION.lng + (s.lng - MOCK_CURRENT_POSITION.lng) * 0.75,
      },
    ],
    shareUrl: `https://bunbungus.app/places/${s.id}`,
  }
}

export const MOCK_PLACES: PlaceDetail[] = SEEDS.map(toDetail)

export const MOCK_DRIVE_CONDITIONS: DriveConditions = {
  weather: { label: '맑음', temperature: 22 },
  traffic: '원활',
  theme: '바다 드라이브',
  carConnected: true,
}

export const RANDOM_THEMES = ['바다 드라이브', '야경 드라이브', '카페 드라이브', '숲길 드라이브', '노을 드라이브']

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

export function createMockNotifications(): HomeNotification[] {
  return [
    {
      id: 'n1',
      senderName: '민지',
      title: '민지님이 드라이브 장소를 공유했어요. 💌',
      description: '이번 주말, 함께 떠나보는 건 어떨까요?',
      receivedAt: hoursAgo(17),
      read: false,
      placeId: 'oido',
    },
    {
      id: 'n2',
      senderName: '민지',
      title: '민지님이 드라이브 코스를 보냈어요.',
      description: '반짝이는 야경 보러 가요!',
      receivedAt: hoursAgo(24),
      read: true,
      placeId: 'banpo',
    },
    {
      id: 'n3',
      senderName: '민지',
      title: '민지님이 드라이브 장소를 공유했어요.',
      description: '가을 단풍 보러 가볼까요?',
      receivedAt: hoursAgo(24 * 8),
      read: true,
      placeId: 'sanjeong',
    },
  ]
}
