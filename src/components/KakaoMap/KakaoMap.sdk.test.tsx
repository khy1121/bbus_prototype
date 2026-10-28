import { render, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { KakaoMap, type MapMarker } from './KakaoMap'

// ---- 카카오맵 SDK 가짜 구현 (호출 기록용) ----
const calls = vi.hoisted(() => ({
  setBounds: 0,
  setLevel: 0,
  setCenter: 0,
  polylines: [] as { path: unknown[]; map: unknown }[],
  polylineCreated: 0,
  pathUpdated: [] as number[],
  overlayCreated: 0,
  overlayMoved: 0,
  overlayRemoved: 0,
  contentSet: 0,
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
    constructor() {
      calls.overlayCreated += 1
    }
    setMap(map: unknown) {
      if (map === null) calls.overlayRemoved += 1
    }
    setPosition() {
      calls.overlayMoved += 1
    }
    setZIndex() {}
    setContent() {
      calls.contentSet += 1
    }
  }
  class Polyline {
    opts: { path: unknown[] }
    constructor(opts: { path: unknown[] }) {
      this.opts = opts
      calls.polylineCreated += 1
    }
    setMap(map: unknown) {
      calls.polylines.push({ path: this.opts.path, map })
    }
    setPath(path: unknown[]) {
      calls.pathUpdated.push(path.length)
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
    calls.polylineCreated = 0
    calls.pathUpdated = []
    calls.overlayCreated = 0
    calls.overlayMoved = 0
    calls.overlayRemoved = 0
    calls.contentSet = 0
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

  it('차량 마커만 움직이면 기존 오버레이를 옮기기만 하고, 경로선·다른 마커는 다시 만들지 않는다 (확대 중 깜빡임 방지)', async () => {
    const dest: MapMarker = { id: 'dest', position: { lat: 37.52, lng: 126.97 } }
    const { rerender } = render(<KakaoMap label="지도" center={path[0]} path={path} markers={[dest, car(37.48)]} />)
    await waitFor(() => expect(calls.overlayCreated).toBe(2))
    const lines = calls.polylineCreated

    rerender(<KakaoMap label="지도" center={path[0]} path={path} markers={[dest, car(37.49)]} />)
    rerender(<KakaoMap label="지도" center={path[0]} path={path} markers={[dest, car(37.5)]} />)

    expect(calls.overlayCreated).toBe(2) // 새로 만들지 않음
    expect(calls.overlayRemoved).toBe(0)
    expect(calls.overlayMoved).toBeGreaterThanOrEqual(2) // 차량만 이동
    expect(calls.polylineCreated).toBe(lines) // 경로선 유지
  })

  it('마커가 새로 생기거나 사라질 때만 오버레이를 추가·제거한다', async () => {
    const a: MapMarker = { id: 'a', position: { lat: 37.5, lng: 127 } }
    const b: MapMarker = { id: 'b', position: { lat: 37.6, lng: 127.1 } }
    const { rerender } = render(<KakaoMap label="지도" center={path[0]} markers={[a]} />)
    await waitFor(() => expect(calls.overlayCreated).toBe(1))
    rerender(<KakaoMap label="지도" center={path[0]} markers={[a, b]} />)
    expect(calls.overlayCreated).toBe(2)
    rerender(<KakaoMap label="지도" center={path[0]} markers={[b]} />)
    expect(calls.overlayRemoved).toBe(1)
  })

  it('경로가 바뀌면 경로선을 다시 그린다', async () => {
    const { rerender } = render(<KakaoMap label="지도" center={path[0]} path={path} />)
    await waitFor(() => expect(calls.polylineCreated).toBeGreaterThan(0))
    const before = calls.polylineCreated
    rerender(<KakaoMap label="지도" center={path[0]} path={[path[0], { lat: 37.7, lng: 127.2 }]} />)
    expect(calls.polylineCreated).toBeGreaterThan(before)
  })

  it('contentKey 가 바뀌면 오버레이는 그대로 두고 내용(이미지)만 바꾼다 — 차량 방향 전환', async () => {
    const render1 = vi.fn(() => document.createElement('img'))
    const marker = (contentKey: string): MapMarker => ({ id: 'car', position: path[0], contentKey, render: render1 })
    const { rerender } = render(<KakaoMap label="지도" center={path[0]} markers={[marker('E')]} />)
    await waitFor(() => expect(calls.overlayCreated).toBe(1))

    rerender(<KakaoMap label="지도" center={path[0]} markers={[marker('E')]} />)
    expect(calls.contentSet).toBe(0) // 같은 방향이면 그대로

    rerender(<KakaoMap label="지도" center={path[0]} markers={[marker('N')]} />)
    expect(calls.contentSet).toBe(1)
    expect(calls.overlayCreated).toBe(1)
    expect(render1).toHaveBeenCalledTimes(2)
  })

  it('pathProgressKm: 지나온 길은 그리지 않고, 경로선을 다시 만들지 않고 좌표만 갱신한다 (범위 맞춤은 전체 경로 기준 유지)', async () => {
    const long = [
      { lat: 37.4, lng: 127 },
      { lat: 37.45, lng: 127 },
      { lat: 37.5, lng: 127 },
    ]
    const { rerender } = render(<KakaoMap label="지도" center={long[0]} path={long} pathProgressKm={0} fitBounds />)
    await waitFor(() => expect(calls.polylineCreated).toBeGreaterThan(0))
    const created = calls.polylineCreated
    const fits = calls.setBounds

    rerender(<KakaoMap label="지도" center={long[0]} path={long} pathProgressKm={7} fitBounds />)
    expect(calls.polylineCreated).toBe(created) // 다시 만들지 않음
    expect(calls.pathUpdated.at(-1)).toBe(2) // 현재 지점 + 남은 꼭짓점 1개
    expect(calls.setBounds).toBe(fits) // 전체 경로 기준이라 다시 맞추지 않음
  })
})
