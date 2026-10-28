import { cumulativeKm } from '@/lib/geo'
import type { DriveRoute, RestStop } from '../types'

/**
 * 휴게소 접근 알림 기준 거리(km).
 * 카카오내비·네이버 지도는 공개된 기준이 없어 확인 불가 → 디자인 문구('전방 2km 앞에')에 맞춰 2km.
 * 표시 시간은 따로 두지 않고, 휴게소를 지나치면 자동으로 사라진다.
 */
export const REST_STOP_ALERT_KM = 2

export type RestStopAlert = { stop: RestStop; remainingKm: number }

const sq = (n: number) => n * n

/** 각 휴게소가 경로 시작점에서 몇 km 지점인지 — 경로 위 가장 가까운 점까지의 실제 누적 거리 기준 */
export function restStopOffsetsKm(route: DriveRoute): { stop: RestStop; offsetKm: number }[] {
  const acc = cumulativeKm(route.path)
  const pathKm = acc[acc.length - 1] || 1
  return route.restStops.map((stop) => {
    let nearest = 0
    let best = Infinity
    route.path.forEach((p, i) => {
      const d = sq(p.lat - stop.position.lat) + sq(p.lng - stop.position.lng)
      if (d < best) {
        best = d
        nearest = i
      }
    })
    // 경로 좌표 길이와 길찾기 요약 거리의 차이를 보정해 route.distanceKm 기준으로 환산
    const offsetKm = (acc[nearest] / pathKm) * route.distanceKm
    return { stop, offsetKm: Math.round(offsetKm * 1000) / 1000 }
  })
}

/**
 * 지금 보여줄 휴게소 접근 알림.
 * - 앞쪽 REST_STOP_ALERT_KM 이내의 가장 가까운 휴게소
 * - 지나친 휴게소, 사용자가 닫은 휴게소는 제외 (같은 휴게소 중복 알림 방지)
 */
export function findRestStopAlert(
  route: DriveRoute,
  traveledKm: number,
  dismissedIds: readonly string[],
): RestStopAlert | null {
  const candidates = restStopOffsetsKm(route)
    .filter(({ stop }) => !dismissedIds.includes(stop.id))
    .map(({ stop, offsetKm }) => ({ stop, remainingKm: Math.round((offsetKm - traveledKm) * 1000) / 1000 }))
    .filter(({ remainingKm }) => remainingKm > 0 && remainingKm <= REST_STOP_ALERT_KM)
    .sort((a, b) => a.remainingKm - b.remainingKm)
  return candidates[0] ?? null
}

/** 1km 이상: 1.5km / 2km, 1km 미만: 100m 단위 */
export function formatAlertDistance(km: number): string {
  if (km >= 1) return `${Number(km.toFixed(1))}km`
  return `${Math.max(Math.round((km * 1000) / 100) * 100, 100)}m`
}
