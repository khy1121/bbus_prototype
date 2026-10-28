import type { LatLng } from '@/components/KakaoMap/KakaoMap'

export type RecordPlaylist = {
  title: string
  trackCount: number
  /** 총 재생 시간(분). 없으면 '00분' 으로 표시 */
  durationMin?: number
  cover: string
}

/** 드라이브 기록 카드 */
export type DriveRecord = {
  id: string
  title: string
  /** 대표 장소명 (예: 시흥 오이도) */
  place: string
  /** YYYY-MM-DD */
  date: string
  distanceKm: number
  durationMin: number
  stampCount: number
  position: LatLng
  /** 지도 마커/목록 썸네일 */
  thumbnail: string
  photos: string[]
  playlist?: RecordPlaylist
  messages: { driver?: string; passenger?: string }
}
