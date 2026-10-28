import type { PlaceSummary } from '@/components/PlaceCard/PlaceCard'
import {
  createMockNotifications,
  MOCK_DRIVE_CONDITIONS,
  MOCK_PLACES,
  RANDOM_THEMES,
} from './mocks'
import type { CategoryId, DriveConditions, HomeNotification, PlaceDetail } from './types'

export const PLACES_PER_PAGE = 7

const delay = <T,>(value: T, ms = 0) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

const toSummary = ({ id, name, region, duration, thumbnail, hashtags }: PlaceDetail): PlaceSummary => ({
  id,
  name,
  region,
  duration,
  thumbnail,
  hashtags,
})

/**
 * 현재 위치 반경 5km 의 날씨/교통 + 랜덤 추천 테마
 * TODO(backend): 날씨 API, 교통 API, 차량(블루투스) 연결 상태 연동
 */
export async function fetchDriveConditions(): Promise<DriveConditions> {
  const theme = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)]
  return delay({ ...MOCK_DRIVE_CONDITIONS, theme })
}

/**
 * 카테고리별 추천 장소 (7개). page 가 바뀌면 새로운 추천(새로고침)
 * TODO(backend): GET /places?category=&page=
 */
export async function fetchPlacesByCategory(category: CategoryId, page = 0): Promise<PlaceSummary[]> {
  const list = MOCK_PLACES.filter((p) => p.category === category).map(toSummary)
  const offset = (page * 3) % list.length
  return delay([...list.slice(offset), ...list.slice(0, offset)].slice(0, PLACES_PER_PAGE))
}

/** TODO(backend): GET /places/:id */
export async function fetchPlaceDetail(placeId: string): Promise<PlaceDetail | null> {
  return delay(MOCK_PLACES.find((p) => p.id === placeId) ?? null)
}

/** TODO(backend): GET /notifications (30일 지난 알림은 서버에서 삭제) */
export async function fetchNotifications(): Promise<HomeNotification[]> {
  return delay(createMockNotifications())
}

/** TODO(backend): PATCH /notifications/:id/read */
export async function markNotificationRead(notificationId: string): Promise<void> {
  void notificationId
  return delay(undefined)
}

/** TODO(backend): POST /places/:id/like (마이페이지 찜 목록) */
export async function setPlaceLiked(placeId: string, liked: boolean): Promise<void> {
  void placeId
  void liked
  return delay(undefined)
}

/** TODO(backend): POST /couple/share — 연인에게 장소/코스 공유 + 푸시 알림 발송 */
export async function sendPlaceToPartner(placeId: string): Promise<void> {
  void placeId
  return delay(undefined)
}
