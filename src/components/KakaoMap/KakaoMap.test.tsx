import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { KakaoMap } from './KakaoMap'

vi.mock('@/lib/kakao/loadKakaoMaps', () => ({
  getKakaoMapKey: () => undefined,
  loadKakaoMaps: () => Promise.reject(new Error('no key')),
}))

describe('KakaoMap', () => {
  it('키가 없으면 지도 대신 플레이스홀더를 보여준다 (지도는 region — 마커 버튼이 보조기기에 노출되도록)', () => {
    render(<KakaoMap label="경로 미리보기" center={{ lat: 37.5, lng: 127 }} />)
    expect(screen.getByRole('region', { name: '경로 미리보기' })).toBeInTheDocument()
    expect(screen.getByTestId('kakao-map-placeholder')).toBeInTheDocument()
  })

  it('placeholder 안에 children(오버레이 UI) 을 함께 렌더링한다', () => {
    render(
      <KakaoMap label="지도" center={{ lat: 37.5, lng: 127 }}>
        <button type="button">현재 위치</button>
      </KakaoMap>,
    )
    expect(screen.getByRole('button', { name: '현재 위치' })).toBeInTheDocument()
  })
})

describe('KakaoMap 터치 제스처', () => {
  it('지도 위 핀치가 페이지 확대로 새지 않도록 iOS gesture 이벤트를 막는다 (지도 영역만)', () => {
    render(<KakaoMap label="지도" center={{ lat: 37.5, lng: 127 }} />)
    const map = screen.getByRole('region', { name: '지도' })
    for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
      const event = new Event(type, { bubbles: true, cancelable: true })
      map.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
    }
    // 지도 밖에서는 기본 동작(페이지 확대) 유지 — 접근성
    const outside = new Event('gesturestart', { bubbles: true, cancelable: true })
    document.body.dispatchEvent(outside)
    expect(outside.defaultPrevented).toBe(false)
  })

  it('읽기 전용 지도(interactive=false)는 막지 않는다 — 페이지 스크롤·확대가 그대로 되도록', () => {
    render(<KakaoMap label="미리보기" center={{ lat: 37.5, lng: 127 }} interactive={false} />)
    const map = screen.getByRole('region', { name: '미리보기' })
    const event = new Event('gesturestart', { bubbles: true, cancelable: true })
    map.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(map.className).not.toMatch(/interactive/)
  })
})
