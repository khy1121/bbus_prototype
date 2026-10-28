import type { LatLng } from '@/components/KakaoMap/KakaoMap'
import type { PlaceSummary } from '@/components/PlaceCard/PlaceCard'

export type CategoryId = 'sea' | 'night' | 'cafe' | 'nature' | 'camp'

export type Category = { id: CategoryId; label: string }

export type TrafficLevel = '원활' | '서행' | '정체'

/** 홈 상단 드라이브 정보 배너 데이터 — 값이 null 이면 '- -' 로 표시 */
export type DriveConditions = {
  weather: { label: string; temperature: number } | null
  traffic: TrafficLevel | null
  theme: string
  carConnected: boolean
}

export type PlaceDriveSummary = {
  duration: string
  mainRoute: string
  parking: string
  visitTime: string
  visitTimeNote?: string
}

export type PlaceDetail = PlaceSummary & {
  category: CategoryId
  address: string
  intro: string
  photos: string[]
  summary: PlaceDriveSummary
  position: LatLng
  /** 경로 미리보기의 주요 경유 지점 */
  waypoints: LatLng[]
  shareUrl: string
}

export type HomeNotification = {
  id: string
  senderName: string
  title: string
  description: string
  /** ISO 수신 시각 */
  receivedAt: string
  read: boolean
  placeId: string
}
