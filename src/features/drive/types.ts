import type { LatLng } from '@/components/KakaoMap/KakaoMap'

export type Place = {
  id: string
  name: string
  address: string
  /** 현재 위치로부터의 거리(km) */
  distanceKm: number
  position: LatLng
}

export type RecentSearch = { id: string; keyword: string; /** MM.DD */ date: string }

export type RestStopMenu = { name: string; description: string; image: string }

export type RestStop = {
  id: string
  name: string
  highway: string
  description: string
  position: LatLng
  menus: RestStopMenu[]
  /** 획득 도장 색 */
  stampColor: 'orange' | 'pink'
}

export type DriveRoute = {
  path: LatLng[]
  restStops: RestStop[]
  distanceKm: number
  durationMin: number
}

export type Track = { id: string; title: string; artist: string; /** 초 */ duration: number; albumArt: string }

export type Playlist = { id: string; title: string; keywords: string[]; tracks: Track[] }

export type PlaylistPreference = { moods: string[]; weather: string | null; genres: string[] }

export type RadioStory = { id: string; text: string; script: string; createdAt: string }

export type BalanceQuestion = { id: string; question: string; a: string; b: string }
export type QuizQuestion = { id: string; question: string; answer: string; hint: string }
export type MemoryQuestion = { id: string; question: string }

export type Player = 'driver' | 'passenger'
export const PLAYER_LABEL: Record<Player, string> = { driver: '운전자', passenger: '동승자' }
