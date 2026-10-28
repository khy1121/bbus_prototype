import { render, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { KakaoMap, type MapMarker } from './KakaoMap'

// ---- 카카오맵 SDK 가짜 구현 (호출 기록용) ----
const calls = vi.hoisted(() => ({
  setBounds: 0,
  setLevel: 0,
  setCenter: 0,
  polylines: [] as { path: unknown[]; map: unknown }[],
  listeners: {} as Record<string, () => void>,
}))

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
    setCenter() {
      calls.setCenter += 1
    }
    setLevel() {
      calls.setLevel += 1
    }
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
  const event = {
    addListener: (_target: unknown, type: string, handler: () => void) => {
      calls.listeners[type] = handler
    },
    removeListener: (_target: unknown, type: string) => {
      delete calls.listeners[type]
    },
  }
  return { maps: { LatLng, LatLngBounds, Map, CustomOverlay, Polyline, event, load: (cb: () => void) => cb() } }
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
    calls.setLevel = 0
    calls.setCenter = 0
    calls.polylines = []
    calls.listeners = {}
  })

  it('중심만 바뀌면 확대 레벨을 건드리지 않는다 — 운행 중 사용자가 확대한 상태 유지', async () => {
    const { rerender } = render(<KakaoMap label="지도" center={path[0]} level={8} />)
    await waitFor(() => expect(calls.setCenter).toBeGreaterThan(0))
    const levelCalls = calls.setLevel
    rerender(<KakaoMap label="지도" center={{ lat: 37.49, lng: 127.02 }} level={8} />)
    rerender(<KakaoMap label="지도" center={{ lat: 37.5, lng: 127.01 }} level={8} />)
    await waitFor(() => expect(calls.setCenter).toBeGreaterThanOrEqual(3))
    expect(calls.setLevel).toBe(levelCalls)

    // level prop 자체가 바뀔 때만 레벨 변경
    rerender(<KakaoMap label="지도" center={{ lat: 37.5, lng: 127.01 }} level={5} />)
    await waitFor(() => expect(calls.setLevel).toBe(levelCalls + 1))
  })

  it('사용자가 지도를 끌면 onUserDrag 를 호출한다', async () => {
    const onUserDrag = vi.fn()
    render(<KakaoMap label="지도" center={path[0]} onUserDrag={onUserDrag} />)
    await waitFor(() => expect(calls.listeners.dragstart).toBeDefined())
    calls.listeners.dragstart()
    expect(onUserDrag).toHaveBeenCalled()
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
