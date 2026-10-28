import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// jsdom 에는 matchMedia 가 없다 — 기본은 모바일(모든 쿼리 false)
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// jsdom 에는 scrollTo 가 없다
window.scrollTo = () => {}
Element.prototype.scrollTo = function () {}

// 현재 위치(GPS·역지오코딩)는 테스트에서 고정값 — 위치 모듈 자체 테스트는 vi.unmock 으로 실제 구현 사용
vi.mock('@/lib/location', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/location')>()
  return {
    ...actual,
    locate: vi.fn(async () => ({ lat: 37.4837, lng: 127.0324 })),
    reverseGeocodeRegion: vi.fn(async () => '서초구 서초동'),
  }
})
