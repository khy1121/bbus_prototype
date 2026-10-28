import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { useHomeStore } from '../homeStore'
import { PlaceDetailPage } from './PlaceDetailPage'

vi.mock('@/lib/kakao/loadKakaoMaps', () => ({
  getKakaoMapKey: () => undefined,
  loadKakaoMaps: () => Promise.reject(new Error('no key')),
}))

const permission = { granted: true, request: vi.fn(async () => true) }
vi.mock('../hooks/useLocationPermission', () => ({ useLocationPermission: () => permission }))

function renderPage(placeId = 'oido') {
  const router = createMemoryRouter(
    [
      { path: '/', element: <p>홈 화면</p> },
      { path: '/places/:placeId', element: <PlaceDetailPage /> },
      { path: '/couple/invite', element: <p>커플 초대 화면</p> },
    ],
    { initialEntries: ['/', `/places/${placeId}`], initialIndex: 1 },
  )
  return { user: userEvent.setup(), router, ...render(<RouterProvider router={router} />) }
}

describe('PlaceDetailPage', () => {
  beforeEach(() => {
    permission.granted = true
    useHomeStore.setState({ likedIds: [] })
    useUiStore.getState().closeDriveStart()
    useUserStore.setState({ partnerLinked: true, partnerName: '민지' })
  })

  it('장소 정보, 해시태그, 소개, 사진 카운터, 드라이브 정보 요약, 경로 미리보기를 보여준다', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { name: '시흥 오이도', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('경기 시흥시 · 약 1시간')).toBeInTheDocument()
    expect(screen.getByText('#일몰')).toBeInTheDocument()
    expect(screen.getByText(/붉은 등대와 아름다운 노을/)).toBeInTheDocument()
    expect(screen.getByText('1 / 8')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: '드라이브 정보 요약' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '경로 미리보기' })).toBeInTheDocument()
    expect(screen.getByText('바다')).toBeInTheDocument()
  })

  it('뒤로가기 → 이전 화면', async () => {
    const { user, router } = renderPage()
    await user.click(await screen.findByRole('button', { name: '뒤로가기' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('찜 버튼을 누르면 채워지고 찜 목록에 추가된다', async () => {
    const { user } = renderPage()
    const like = await screen.findByRole('button', { name: '찜하기' })
    expect(like).toHaveAttribute('aria-pressed', 'false')
    await user.click(like)
    expect(like).toHaveAttribute('aria-pressed', 'true')
    expect(useHomeStore.getState().likedIds).toContain('oido')
  })

  it('공유 아이콘 → 공유하기 바텀시트', async () => {
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: '공유하기' }))
    expect(screen.getByRole('dialog', { name: '공유하기' })).toBeInTheDocument()
  })

  it('사진을 누르면 자세히 보기 뷰어가 열린다', async () => {
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: '시흥 오이도 사진 1 크게 보기' }))
    expect(screen.getByRole('dialog', { name: '시흥 오이도 사진 자세히 보기' })).toBeInTheDocument()
  })

  it('연인에게 보내기 → 확인 → 전송 완료', async () => {
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: '연인에게 보내기' }))
    await user.click(screen.getByRole('button', { name: '보내기' }))
    expect(await screen.findByRole('dialog', { name: '드라이브 코스 전송 완료!' })).toBeInTheDocument()
  })

  it('연인과 연동되지 않았으면 보내기 시 커플 초대 화면으로 이동한다', async () => {
    useUserStore.setState({ partnerLinked: false })
    const { user, router } = renderPage()
    await user.click(await screen.findByRole('button', { name: '연인에게 보내기' }))
    await user.click(screen.getByRole('button', { name: '보내기' }))
    expect(router.state.location.pathname).toBe('/couple/invite')
  })

  it('드라이브 시작하기 → 이 장소를 목적지로 드라이브명 입력 팝업을 연다', async () => {
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: '드라이브 시작하기' }))
    const { driveStart } = useUiStore.getState()
    expect(driveStart.open).toBe(true)
    expect(driveStart.destination).toMatchObject({ id: 'oido', name: '시흥 오이도' })
  })

  it('위치 권한이 없으면 예상 시간 "- -", 경로 미리보기 클릭 시 권한 팝업', async () => {
    permission.granted = false
    const { user } = renderPage()
    expect(await screen.findByText('- -')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /위치 권한을 허용하면/ }))
    expect(screen.getByRole('dialog', { name: '위치 권한이 필요해요' })).toBeInTheDocument()
  })

  it('없는 장소면 안내를 보여준다', async () => {
    renderPage('nope')
    expect(await screen.findByText('장소를 찾을 수 없어요')).toBeInTheDocument()
  })
})
