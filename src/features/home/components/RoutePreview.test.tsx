import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { RoutePreview } from './RoutePreview'

vi.mock('@/lib/kakao/loadKakaoMaps', () => ({
  getKakaoMapKey: () => undefined,
  loadKakaoMaps: () => Promise.reject(new Error('no key')),
}))

const props = {
  start: { lat: 37.48, lng: 127.03 },
  end: { lat: 37.34, lng: 126.68 },
  waypoints: [{ lat: 37.4, lng: 126.9 }],
}

describe('RoutePreview', () => {
  it('제목과 읽기 전용 지도를 보여준다', () => {
    setup(<RoutePreview {...props} locationGranted onRequestPermission={() => {}} />)
    expect(screen.getByRole('heading', { name: '경로 미리보기' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '현재 위치에서 목적지까지의 경로' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /위치 권한/ })).not.toBeInTheDocument()
  })

  it('위치 권한이 없으면 블러 처리하고, 누르면 권한 요청 콜백을 호출한다', async () => {
    const onRequestPermission = vi.fn()
    const { user } = setup(<RoutePreview {...props} locationGranted={false} onRequestPermission={onRequestPermission} />)
    await user.click(screen.getByRole('button', { name: /위치 권한을 허용하면 경로를 볼 수 있어요/ }))
    expect(onRequestPermission).toHaveBeenCalled()
  })
})
