/**
 * 카카오모빌리티 자동차 길찾기 API (REST) — 요청 URL 생성과 응답 파싱.
 * 서버(Vercel 함수 / Vite 개발 서버)에서만 호출한다. REST API 키는 브라우저에 노출하면 안 된다.
 * https://developers.kakaomobility.com
 */

// 서버(Node ESM)에서도 import 하므로 다른 모듈에 의존하지 않는다
type LatLng = { lat: number; lng: number }

export const DIRECTIONS_ENDPOINT = 'https://apis-navi.kakaomobility.com/v1/directions'

export type DirectionsResult = {
  path: LatLng[]
  distanceKm: number
  durationMin: number
}

/** 카카오 좌표 파라미터는 "경도(x),위도(y)" 순서 */
const toXY = (p: LatLng) => `${p.lng},${p.lat}`

export function buildDirectionsUrl(origin: LatLng, destination: LatLng): string {
  const url = new URL(DIRECTIONS_ENDPOINT)
  url.searchParams.set('origin', toXY(origin))
  url.searchParams.set('destination', toXY(destination))
  url.searchParams.set('priority', 'RECOMMEND')
  url.searchParams.set('road_details', 'false')
  return url.toString()
}

type RawDirections = {
  routes?: {
    result_code: number
    result_msg?: string
    summary?: { distance: number; duration: number }
    sections?: { roads?: { vertexes?: number[] }[] }[]
  }[]
}

/** 응답 → 경로 좌표. 각 도로의 vertexes 는 [x1, y1, x2, y2, …] (x=경도, y=위도) */
export function parseDirections(json: RawDirections): DirectionsResult {
  const route = json.routes?.[0]
  if (!route) throw new Error('길찾기 응답이 비어 있어요.')
  if (route.result_code !== 0) throw new Error(route.result_msg || `길찾기 실패 (${route.result_code})`)

  const path: LatLng[] = []
  for (const section of route.sections ?? []) {
    for (const road of section.roads ?? []) {
      const v = road.vertexes ?? []
      for (let i = 0; i + 1 < v.length; i += 2) {
        const point = { lng: v[i], lat: v[i + 1] }
        const last = path[path.length - 1]
        // 도로 경계에서 겹치는 점은 한 번만
        if (!last || last.lat !== point.lat || last.lng !== point.lng) path.push(point)
      }
    }
  }
  return {
    path,
    distanceKm: (route.summary?.distance ?? 0) / 1000,
    durationMin: Math.round((route.summary?.duration ?? 0) / 60),
  }
}

/** "위도,경도" 쿼리 파라미터 검증 (숫자·범위 외 값은 거부) */
export function parseLatLngParam(value: string | null): LatLng | null {
  if (!value) return null
  const [lat, lng] = value.split(',').map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

/**
 * 프록시 공통 처리 — Vercel 함수와 Vite 개발 서버 미들웨어가 함께 쓴다.
 * @returns HTTP 상태 코드와 JSON 본문
 */
export async function handleDirectionsRequest(
  search: URLSearchParams,
  restApiKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<{ status: number; body: unknown }> {
  if (!restApiKey) return { status: 503, body: { error: 'KAKAO_REST_API_KEY 가 설정되지 않았습니다.' } }
  const origin = parseLatLngParam(search.get('origin'))
  const destination = parseLatLngParam(search.get('destination'))
  if (!origin || !destination)
    return { status: 400, body: { error: 'origin/destination 은 "위도,경도" 형식이어야 해요.' } }

  try {
    const res = await fetchImpl(buildDirectionsUrl(origin, destination), {
      headers: { Authorization: `KakaoAK ${restApiKey}` },
    })
    if (!res.ok) return { status: 502, body: { error: `카카오모빌리티 응답 오류 (${res.status})` } }
    return { status: 200, body: parseDirections((await res.json()) as RawDirections) }
  } catch (e) {
    return { status: 502, body: { error: e instanceof Error ? e.message : '길찾기 실패' } }
  }
}
