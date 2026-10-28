export type LatLng = { lat: number; lng: number }

const EARTH_RADIUS_KM = 6371
const rad = (deg: number) => (deg * Math.PI) / 180

/** 두 좌표 사이 대원 거리(km) */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(x))
}

/** 경로 시작점부터 각 점까지의 누적 거리(km) */
export function cumulativeKm(path: LatLng[]): number[] {
  const acc = [0]
  for (let i = 1; i < path.length; i++) acc.push(acc[i - 1] + haversineKm(path[i - 1], path[i]))
  return acc
}

/** 경로를 따라 km 만큼 간 지점 (점 간격과 무관하게 실제 거리 기준 보간) */
export function pointAtKm(path: LatLng[], km: number, acc: number[] = cumulativeKm(path)): LatLng {
  if (path.length === 0) throw new Error('빈 경로')
  if (km <= 0) return path[0]
  const total = acc[acc.length - 1]
  if (km >= total) return path[path.length - 1]
  let i = 1
  while (acc[i] < km) i++
  const t = (km - acc[i - 1]) / (acc[i] - acc[i - 1] || 1)
  const a = path[i - 1]
  const b = path[i]
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t }
}

/** 경로에서 km 지점 이후만 (현재 지점 보간 포함). 끝까지 갔으면 빈 배열 */
export function remainingPath(path: LatLng[], km: number, acc: number[] = cumulativeKm(path)): LatLng[] {
  const total = acc[acc.length - 1] ?? 0
  if (km <= 0) return path
  if (km >= total) return []
  const next = acc.findIndex((d) => d > km)
  return [pointAtKm(path, km, acc), ...path.slice(next)]
}
