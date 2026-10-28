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
