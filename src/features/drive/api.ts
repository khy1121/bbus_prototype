import type { PlaceSummary } from '@/components'
import type { LatLng } from '@/components/KakaoMap/KakaoMap'
import { cumulativeKm, haversineKm, pointAtKm } from '@/lib/geo'
import { locate, reverseGeocodeRegion } from '@/lib/location'
import {
  BALANCE_QUESTIONS,
  djScript,
  MEMORY_QUESTIONS,
  MOCK_PLACES,
  MOCK_POPULAR_ROUTES,
  MOCK_REST_STOPS,
  MOCK_TRACKS,
  QUIZ_QUESTIONS,
  RANDOM_STORIES,
} from './mocks'
import type {
  BalanceQuestion,
  DriveRoute,
  MemoryQuestion,
  Place,
  Playlist,
  PlaylistPreference,
  QuizQuestion,
  RadioStory,
  RestStop,
} from './types'

/*
 * 드라이브 모드 API 레이어.
 * 현재는 목업을 돌려준다. 실제 연동 시 함수 시그니처는 유지하고 내부만 교체한다.
 */

export type CurrentLocation = { position: LatLng; address: string }

let lastLocation: { at: number; value: Promise<CurrentLocation> } | null = null
const LOCATION_TTL_MS = 30_000

/** 위치 캐시 비우기 (권한을 새로 허용했을 때·테스트) */
export function resetLocationCache() {
  lastLocation = null
}

/**
 * 현재 위치 = 브라우저 GPS 좌표 + 카카오 역지오코딩 지역명('서초구 서초동').
 * 여러 화면에서 연달아 부르므로 30초 동안은 같은 결과를 재사용한다.
 * 위치 권한이 없거나 찾지 못하면 LocationError 로 reject.
 */
export function getCurrentLocation({ fresh = false }: { fresh?: boolean } = {}): Promise<CurrentLocation> {
  if (!fresh && lastLocation && Date.now() - lastLocation.at < LOCATION_TTL_MS) return lastLocation.value
  const value = locate().then(async (position) => ({
    position,
    // 지역명은 부가 정보 — 실패해도 좌표는 쓴다
    address: await reverseGeocodeRegion(position).catch(() => ''),
  }))
  lastLocation = { at: Date.now(), value }
  value.catch(() => {
    if (lastLocation?.value === value) lastLocation = null
  })
  return value
}

// TODO(backend): 카카오 로컬 API 키워드 검색 (거리순 정렬)
export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim()
  if (!q) return []
  return MOCK_PLACES.filter((p) => p.name.includes(q)).sort((a, b) => a.distanceKm - b.distanceKm)
}

export async function getPlace(id: string): Promise<Place | undefined> {
  return MOCK_PLACES.find((p) => p.id === id)
}

// TODO(backend): 인기 드라이브 경로 API
export async function getPopularRoutes(): Promise<PlaceSummary[]> {
  return MOCK_POPULAR_ROUTES
}

/** 경로 위 휴게소 배치 지점 (전체 거리 대비 비율) */
const REST_STOP_FRACTIONS = [0.3, 0.55, 0.8]

/** 카카오모빌리티 길찾기 결과 (서버 프록시 /api/directions 응답) */
type DirectionsResponse = { path: LatLng[]; distanceKm: number; durationMin: number }

async function fetchDirections(from: LatLng, to: LatLng): Promise<DirectionsResponse> {
  const params = new URLSearchParams({ origin: `${from.lat},${from.lng}`, destination: `${to.lat},${to.lng}` })
  const res = await fetch(`/api/directions?${params}`)
  if (!res.ok) throw new Error(`길찾기 실패 (${res.status})`)
  const data = (await res.json()) as DirectionsResponse
  if (!Array.isArray(data.path) || data.path.length < 2) throw new Error('경로가 비어 있어요.')
  return data
}

/** 길찾기를 쓸 수 없을 때(키 미설정·오류) 보여줄 근사 경로 */
function mockDirections(from: LatLng, to: LatLng): DirectionsResponse {
  const steps = 8
  const path = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    return {
      lat: from.lat + (to.lat - from.lat) * t + Math.sin(t * Math.PI) * 0.02,
      lng: from.lng + (to.lng - from.lng) * t,
    }
  })
  const distanceKm = Math.max(haversineKm(from, to) * 1.3, 1)
  return { path, distanceKm, durationMin: Math.round((distanceKm / 45) * 60) }
}

/**
 * 출발지(현재 위치) → 목적지 경로. 카카오모빌리티 길찾기로 실제 도로를 따라가는 좌표를 받는다.
 * TODO(backend): 경로 내 실제 휴게소 조회 (현재는 목업 휴게소를 경로 위 일정 비율 지점에 배치)
 */
export async function getRoute(origin: LatLng, destination: { position: LatLng }): Promise<DriveRoute> {
  const from = origin
  const to = destination.position
  let directions: DirectionsResponse
  try {
    directions = await fetchDirections(from, to)
  } catch (e) {
    console.warn('[drive] 길찾기 API 를 사용할 수 없어 근사 경로로 대체합니다.', e)
    directions = mockDirections(from, to)
  }
  const acc = cumulativeKm(directions.path)
  const pathKm = acc[acc.length - 1]
  const restStops = MOCK_REST_STOPS.slice(0, REST_STOP_FRACTIONS.length).map((r, i) => ({
    ...r,
    position: pointAtKm(directions.path, pathKm * REST_STOP_FRACTIONS[i], acc),
  }))
  return { ...directions, restStops }
}

// TODO(backend): 휴게소/대표메뉴 데이터 (한국도로공사 공공데이터 등)
export async function getRestStops(): Promise<RestStop[]> {
  return MOCK_REST_STOPS
}

// TODO(backend): GPS 기준 가장 가까운 휴게소 조회
export async function findNearestRestStop(): Promise<RestStop> {
  return MOCK_REST_STOPS[0]
}

// TODO(backend): LLM + 음악 서비스 API 로 플레이리스트 생성 (예상 도착 시간 기반 곡 수)
export async function generatePlaylist(pref: PlaylistPreference, targetSeconds = 3600): Promise<Playlist> {
  const keywords = [...pref.moods, ...(pref.weather ? [pref.weather] : []), ...pref.genres]
  const tracks = []
  let total = 0
  for (let i = 0; total < targetSeconds - 5 * 60; i++) {
    const t = MOCK_TRACKS[i % MOCK_TRACKS.length]
    tracks.push({ ...t, id: `${t.id}-${i}` })
    total += t.duration
  }
  return { id: `pl-${Date.now()}`, title: '노을처럼 따뜻한 우리', keywords, tracks }
}

// TODO(backend): LLM 으로 사연을 라디오 대본으로 변환 + TTS 생성
export async function sendStory(text: string): Promise<RadioStory> {
  return { id: `story-${Date.now()}`, text, script: djScript(text), createdAt: new Date().toISOString().slice(0, 10) }
}

export async function getRandomStory(exclude?: string): Promise<RadioStory> {
  const pool = RANDOM_STORIES.filter((s) => s !== exclude)
  const text = pool[Math.floor(Math.random() * pool.length)]
  return sendStory(text)
}

// TODO(backend): LLM 게임 문제 생성
export async function getBalanceQuestions(): Promise<BalanceQuestion[]> {
  return BALANCE_QUESTIONS
}
export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  return QUIZ_QUESTIONS
}
export async function getMemoryQuestions(): Promise<MemoryQuestion[]> {
  return MEMORY_QUESTIONS
}
