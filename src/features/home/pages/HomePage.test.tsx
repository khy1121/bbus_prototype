import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { useUiStore } from '@/stores/uiStore'
import { useHomeStore } from '../homeStore'
import { HomePage } from './HomePage'

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <HomePage /> },
      { path: '/notifications', element: <p>알림 화면</p> },
      { path: '/places/:placeId', element: <p>상세 화면</p> },
    ],
    { initialEntries: ['/'] },
  )
  return { user: userEvent.setup(), router, ...render(<RouterProvider router={router} />) }
}

describe('HomePage', () => {
  beforeEach(() => {
    useUiStore.getState().closeDriveStart()
    useHomeStore.setState({ likedIds: [], notifications: null })
  })

  it('오늘 날짜, 인사말, 드라이브 정보, 큐레이션 7개 카드를 보여준다', async () => {
    renderPage()
    expect(screen.getByText(/^\d{4}년 \d{1,2}월 \d{1,2}일$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '오늘은 어디로 떠나볼까요?' })).toBeInTheDocument()
    expect(await screen.findByText('22°')).toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(7))
    expect(screen.getByText('시흥 오이도')).toBeInTheDocument()
  })

  it('추천 코스 배너(연인과 떠나는 노을 드라이브)는 노출하지 않는다', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(7))
    expect(screen.queryByText('연인과 떠나는 노을 드라이브')).not.toBeInTheDocument()
  })

  it('읽지 않은 알림이 있으면 빨간 점, 알림 버튼 → 알림 목록', async () => {
    const { user, router } = renderPage()
    expect(await screen.findByTestId('unread-dot')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /알림/ }))
    expect(router.state.location.pathname).toBe('/notifications')
  })

  it('드라이브 시작하기 → 드라이브명 입력 팝업을 연다', async () => {
    const { user } = renderPage()
    await user.click(screen.getByRole('button', { name: '드라이브 시작하기' }))
    expect(useUiStore.getState().driveStart.open).toBe(true)
  })

  it('카테고리 칩을 누르면 해당 테마 장소로 바뀐다', async () => {
    const { user } = renderPage()
    await screen.findByText('시흥 오이도')
    await user.click(screen.getByRole('button', { name: '야경' }))
    expect(await screen.findByText('서울 남산 순환도로')).toBeInTheDocument()
    expect(screen.queryByText('시흥 오이도')).not.toBeInTheDocument()
  })

  it('장소 카드 → 상세 화면, 찜 버튼 → 찜 상태 토글', async () => {
    const { user, router } = renderPage()
    await screen.findByText('시흥 오이도')
    await user.click(screen.getAllByRole('button', { name: '찜하기' })[0])
    expect(useHomeStore.getState().likedIds).toContain('oido')
    await user.click(screen.getByRole('button', { name: /시흥 오이도/ }))
    expect(router.state.location.pathname).toBe('/places/oido')
  })

  it('새로고침 버튼 → 다른 추천 목록', async () => {
    const { user } = renderPage()
    await screen.findByText('시흥 오이도')
    const before = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    await user.click(screen.getByRole('button', { name: '다른 장소 추천받기' }))
    await waitFor(() =>
      expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).not.toEqual(before),
    )
  })
})
