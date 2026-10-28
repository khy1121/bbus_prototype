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

  function touchMove(target: Element, fingers: number) {
    const event = new Event('touchmove', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'touches', { value: Array.from({ length: fingers }, () => ({})) })
    target.dispatchEvent(event)
    return event
  }

  it('두 손가락 터치 이동은 페이지 확대로 새지 않게 막고, 한 손가락은 그대로 둔다 — 지도 내부 요소에서 시작해도', () => {
    render(<KakaoMap label="지도" center={{ lat: 37.5, lng: 127 }} />)
    const map = screen.getByRole('region', { name: '지도' })
    // 카카오맵이 이벤트 전파를 멈춰도 막을 수 있도록 캡처 단계에서 처리
    const inner = map.firstElementChild!
    inner.addEventListener('touchmove', (e) => e.stopPropagation())
    expect(touchMove(inner, 2).defaultPrevented).toBe(true)
    expect(touchMove(inner, 1).defaultPrevented).toBe(false)
  })

  it('지도 화면에 있는 동안만 브라우저 확대를 잠그고, 나가면 원래 viewport 로 되돌린다', () => {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1.0'
    document.head.appendChild(meta)

    const { unmount } = render(<KakaoMap label="지도" center={{ lat: 37.5, lng: 127 }} />)
    expect(meta.content).toContain('maximum-scale=1')
    expect(meta.content).toContain('user-scalable=no')
    unmount()
    expect(meta.content).toBe('width=device-width, initial-scale=1.0')
    meta.remove()
  })
})
