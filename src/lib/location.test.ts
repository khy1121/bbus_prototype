import { vi } from 'vitest'
import { LocationError, locate, regionNameFromKakao } from './location'

vi.unmock('@/lib/location')

function stubGeolocation(impl: (ok: PositionCallback, fail: PositionErrorCallback) => void) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition: vi.fn(impl) },
  })
}

describe('locate (브라우저 GPS)', () => {
  it('현재 좌표를 돌려준다', async () => {
    stubGeolocation((ok) => ok({ coords: { latitude: 37.5665, longitude: 126.978 } } as GeolocationPosition))
    await expect(locate()).resolves.toEqual({ lat: 37.5665, lng: 126.978 })
  })

  it('권한 거부면 LocationError(denied)', async () => {
    stubGeolocation((_, fail) => fail({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError))
    await expect(locate()).rejects.toMatchObject({ name: 'LocationError', reason: 'denied' })
  })

  it('위치를 찾지 못하면 LocationError(unavailable)', async () => {
    stubGeolocation((_, fail) => fail({ code: 2, PERMISSION_DENIED: 1 } as GeolocationPositionError))
    const error = await locate().catch((e: unknown) => e)
    expect(error).toBeInstanceOf(LocationError)
    expect((error as LocationError).reason).toBe('unavailable')
  })
})

describe('regionNameFromKakao (카카오 coord2RegionCode 결과 → 구·동)', () => {
  it('행정동(H) 결과의 2·3단계 지역명을 쓴다', () => {
    expect(
      regionNameFromKakao([
        { region_type: 'B', region_2depth_name: '서초구', region_3depth_name: '서초동' },
        { region_type: 'H', region_2depth_name: '강남구', region_3depth_name: '역삼1동' },
      ]),
    ).toBe('강남구 역삼1동')
  })

  it('결과가 없으면 빈 문자열', () => {
    expect(regionNameFromKakao([])).toBe('')
  })
})
