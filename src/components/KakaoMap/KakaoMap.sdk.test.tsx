import { render, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { KakaoMap, type MapMarker } from './KakaoMap'

// ---- 카카오맵 SDK 가짜 구현 (호출 기록용) ----
const calls = vi.hoisted(() => ({ setBounds: 0, polylines: [] as { path: unknown[]; map: unknown }[] }))

const fakeKakao = vi.hoisted(() => {
  class LatLng {
    lat: number
    lng: number
    constructor(lat: number, lng: number) {
      this.lat = lat
      this.lng = lng
    }
  }
  class LatLngBounds {
    extend() {}
  }
  class Map {
    setCenter() {}
    setLevel() {}
    setBounds() {
      calls.setBounds += 1
    }
  }
  class CustomOverlay {
    setMap() {}
  }
  class Polyline {
    opts: { path: unknown[] }
    constructor(opts: { path: unknown[] }) {
      this.opts = opts
    }
    setMap(map: unknown) {
      calls.polylines.push({ path: this.opts.path, map })
    }
  }
  return { maps: { LatLng, LatLngBounds, Map, CustomOverlay, Polyline, load: (cb: () => void) => cb() } }
})

vi.mock('@/lib/kakao/loadKakaoMaps', () => ({
  getKakaoMapKey: () => 'test-key',
  loadKakaoMaps: () => {
    ;(window as unknown as { kakao: unknown }).kakao = fakeKakao
    return Promise.resolve(fakeKakao)
  },
}))

const path = [
  { lat: 37.48, lng: 127.03 },
  { lat: 37.52, lng: 126.97 },
]
const car = (lat: number): MapMarker => ({ id: 'car', position: { lat, lng: 127 } })

describe('KakaoMap (SDK 연동)', () => {
  beforeEach(() => {
    calls.setBounds = 0
    calls.polylines = []
  })

  it('path 가 있으면 경로 폴리라인을 지도에 그린다', async () => {
    render(<KakaoMap label="지도" center={path[0]} path={path} />)
    await waitFor(() => expect(calls.polylines.at(-1)?.map).toBeTruthy())
    expect(calls.polylines.at(-1)?.path).toHaveLength(2)
  })

  it('fitBounds 는 경로/마커 구성이 바뀔 때만 다시 맞춘다 — 차량 마커 이동마다 화면이 튀지 않게', async () => {
    const { rerender } = render(<KakaoMap label="지도" center={path[0]} path={path} markers={[car(37.48)]} fitBounds />)
    await waitFor(() => expect(calls.setBounds).toBe(1))

    // 같은 경로에서 차량만 이동
    rerender(<KakaoMap label="지도" center={path[0]} path={path} markers={[car(37.49)]} fitBounds />)
    rerender(<KakaoMap label="지도" center={path[0]} path={path} markers={[car(37.5)]} fitBounds />)
    expect(calls.setBounds).toBe(1)

    // 경로가 바뀌면 다시 맞춤
    const newPath = [path[0], { lat: 37.6, lng: 127.1 }]
    rerender(<KakaoMap label="지도" center={path[0]} path={newPath} markers={[car(37.5)]} fitBounds />)
    await waitFor(() => expect(calls.setBounds).toBe(2))
  })
})
