import type { LatLng } from '@/components/KakaoMap/KakaoMap'
import { cumulativeKm, pointAtKm } from '@/lib/geo'
import type { RestStopPlace } from '@/lib/kakao/restStops'
import { MOCK_REST_STOPS } from '../mocks'
import type { RestStop } from '../types'

export type { RestStopPlace }

/** 경로선에서 이 거리(km) 안에 있는 휴게소만 '경로 위'로 본다 (휴게소 좌표는 본선에서 100~300m 떨어져 있다) */
export const ON_ROUTE_KM = 0.4
/** 출발·도착 지점에서 이 거리(km) 안의 휴게소는 제외 (들를 일이 없다) */
const ENDPOINT_MARGIN_KM = 0.5

/** 경로를 따라 stepKm 간격의 검색 지점 (시작·끝 포함). 긴 경로는 maxPoints 개로 간격을 넓힌다 */
export function samplePointsAlongPath(path: LatLng[], stepKm: number, maxPoints = 40): LatLng[] {
  const acc = cumulativeKm(path)
  const total = acc[acc.length - 1] ?? 0
  const step = Math.max(stepKm, total / (maxPoints - 1))
  const points: LatLng[] = []
  for (let km = 0; km < total; km += step) points.push(pointAtKm(path, km, acc))
  points.push(path[path.length - 1])
  return points
}

const KM_PER_DEG_LAT = 111.32

type Projection = { distanceKm: number; offsetKm: number; rightSide: boolean }

/** 점을 경로선에 투영 — 경로선까지 거리, 시작점부터의 경로상 거리, 진행 방향 오른쪽 여부 */
function projectOntoPath(path: LatLng[], acc: number[], p: LatLng): Projection {
  const kmPerDegLng = KM_PER_DEG_LAT * Math.cos((p.lat * Math.PI) / 180)
  // p 를 원점으로 한 평면 좌표(km): x=동쪽, y=북쪽
  const xy = (q: LatLng) => ({ x: (q.lng - p.lng) * kmPerDegLng, y: (q.lat - p.lat) * KM_PER_DEG_LAT })
  let best: Projection = { distanceKm: Infinity, offsetKm: 0, rightSide: false }
  for (let i = 0; i + 1 < path.length; i++) {
    const a = xy(path[i])
    const b = xy(path[i + 1])
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len2 = dx * dx + dy * dy
    const t = len2 === 0 ? 0 : Math.min(Math.max(-(a.x * dx + a.y * dy) / len2, 0), 1)
    const cx = a.x + t * dx
    const cy = a.y + t * dy
    const distanceKm = Math.hypot(cx, cy)
    if (distanceKm < best.distanceKm) {
      // 진행 벡터 × (선 위 점 → p) 의 부호: 음수면 오른쪽
      const cross = dx * -cy - dy * -cx
      best = { distanceKm, offsetKm: acc[i] + t * (acc[i + 1] - acc[i]), rightSide: cross < 0 }
    }
  }
  return best
}

/** '기흥휴게소 부산방향' → '기흥휴게소' (같은 휴게소의 양방향을 한 묶음으로) */
const baseName = (name: string) => name.match(/^(.*?휴게소)/)?.[1] ?? name

/**
 * 검색된 휴게소 중 실제로 경로 위에 있는 것만 경로 순서대로.
 * 양방향 휴게소는 우측 통행 기준 진행 방향 오른쪽(들어갈 수 있는 쪽)을 남긴다.
 */
export function restStopsOnRoute(path: LatLng[], places: RestStopPlace[]): RestStop[] {
  if (path.length < 2) return []
  const acc = cumulativeKm(path)
  const total = acc[acc.length - 1]
  const groups = new Map<string, { place: RestStopPlace; proj: Projection }>()
  for (const place of places) {
    const proj = projectOntoPath(path, acc, place.position)
    if (proj.distanceKm > ON_ROUTE_KM) continue
    if (proj.offsetKm < ENDPOINT_MARGIN_KM || proj.offsetKm > total - ENDPOINT_MARGIN_KM) continue
    const key = baseName(place.name)
    const current = groups.get(key)
    const better =
      !current ||
      (proj.rightSide && !current.proj.rightSide) ||
      (proj.rightSide === current.proj.rightSide && proj.distanceKm < current.proj.distanceKm)
    if (better) groups.set(key, { place, proj })
  }
  return [...groups.values()]
    .sort((a, b) => a.proj.offsetKm - b.proj.offsetKm)
    .map(({ place }, i) => ({
      id: `kakao-${place.id}`,
      name: place.name,
      highway: place.highway,
      position: place.position,
      // TODO(backend): 휴게소 소개·대표 메뉴 (한국도로공사 공공데이터) — 지금은 목업 문구·메뉴
      description: MOCK_REST_STOPS[0].description,
      menus: MOCK_REST_STOPS[0].menus,
      stampColor: i % 3 === 1 ? 'pink' : 'orange',
    }))
}
