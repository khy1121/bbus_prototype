import { loadKakaoMaps } from './kakao/loadKakaoMaps'

export type LatLng = { lat: number; lng: number }

/** denied: 위치 권한 거부 · unavailable: 지원 안 함/신호 없음/시간 초과 */
export class LocationError extends Error {
  readonly reason: 'denied' | 'unavailable'
  constructor(reason: 'denied' | 'unavailable') {
    super(reason === 'denied' ? '위치 권한이 거부되었어요.' : '현재 위치를 찾을 수 없어요.')
    this.name = 'LocationError'
    this.reason = reason
  }
}

/** 브라우저 GPS 로 현재 좌표 */
export function locate(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator) || !navigator.geolocation) {
      reject(new LocationError('unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new LocationError(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable')),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    )
  })
}

type RegionResult = { region_type: string; region_2depth_name: string; region_3depth_name: string }

/** coord2RegionCode 결과에서 '구 동' 이름 (행정동 우선) */
export function regionNameFromKakao(results: RegionResult[]): string {
  const region = results.find((r) => r.region_type === 'H') ?? results[0]
  if (!region) return ''
  return [region.region_2depth_name, region.region_3depth_name].filter(Boolean).join(' ')
}

/** 좌표 → '서초구 서초동' 같은 지역명 (카카오맵 JS SDK services, JS 키 사용) */
export async function reverseGeocodeRegion(position: LatLng): Promise<string> {
  const k = await loadKakaoMaps()
  return new Promise((resolve) => {
    new k.maps.services.Geocoder().coord2RegionCode(position.lng, position.lat, (result, status) => {
      resolve(status === k.maps.services.Status.OK ? regionNameFromKakao(result) : '')
    })
  })
}
