import { cumulativeKm, pointAtKm, type LatLng } from './geo'

export const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const
export type Direction = (typeof DIRECTIONS)[number]

const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** a → b 진행 방위각 (북=0°, 시계방향, 0~360) */
export function bearingDeg(a: LatLng, b: LatLng): number {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat))
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng))
  return (deg(Math.atan2(y, x)) + 360) % 360
}

/** 각도를 8방향 중 가장 가까운 방향으로 */
export function toDirection(bearing: number): Direction {
  const normalized = ((bearing % 360) + 360) % 360
  return DIRECTIONS[Math.round(normalized / 45) % 8]
}

/** 진행 방향을 볼 때 앞쪽으로 내다보는 거리(km) — 짧은 꺾임에 차가 흔들리지 않게 */
const LOOK_AHEAD_KM = 0.05

/** 경로를 따라 km 지점에서의 진행 방위각 */
export function headingAlongPath(path: LatLng[], km: number, acc: number[] = cumulativeKm(path)): number {
  const total = acc[acc.length - 1]
  const at = Math.min(Math.max(km, 0), total)
  const ahead = Math.min(at + LOOK_AHEAD_KM, total)
  // 경로 끝에서는 바로 앞 구간을 기준으로
  const from = ahead - at < 1e-6 ? Math.max(total - LOOK_AHEAD_KM, 0) : at
  return bearingDeg(pointAtKm(path, from, acc), pointAtKm(path, ahead, acc))
}
