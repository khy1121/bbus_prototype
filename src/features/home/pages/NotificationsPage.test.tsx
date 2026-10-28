import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { useHomeStore } from '../homeStore'
import { NotificationsPage } from './NotificationsPage'

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <p>홈 화면</p> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/places/:placeId', element: <p>상세 화면</p> },
    ],
    { initialEntries: ['/', '/notifications'], initialIndex: 1 },
  )
  return { user: userEvent.setup(), router, ...render(<RouterProvider router={router} />) }
}

const base = { senderName: '민지', description: '이번 주말, 함께 떠나보는 건 어떨까요?', placeId: 'oido' }

describe('NotificationsPage', () => {
  beforeEach(() => {
    useHomeStore.setState({
      notifications: [
        { ...base, id: 'a', title: '민지님이 드라이브 장소를 공유했어요. 💌', receivedAt: hoursAgo(17), read: false },
        { ...base, id: 'b', title: '반포 야경', receivedAt: hoursAgo(24 * 8), read: true, placeId: 'banpo' },
      ],
    })
  })

  it('최근 7일 / 최근 30일로 나누어 보여준다', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: '알림' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: '최근 7일' })).toHaveTextContent('민지님이 드라이브 장소를 공유했어요.')
    expect(screen.getByRole('list', { name: '최근 30일' })).toHaveTextContent('반포 야경')
    expect(screen.getByText('17시간 전')).toBeInTheDocument()
  })

  it('읽지 않은 알림은 unread 로 표시한다', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /민지님이 드라이브 장소를 공유했어요/ })).toHaveAttribute('data-unread', 'true')
    expect(screen.getByRole('button', { name: /반포 야경/ })).toHaveAttribute('data-unread', 'false')
  })

  it('알림을 누르면 읽음 처리 후 장소 상세로 이동한다', async () => {
    const { user, router } = renderPage()
    await user.click(screen.getByRole('button', { name: /민지님이 드라이브 장소를 공유했어요/ }))
    expect(useHomeStore.getState().notifications?.find((n) => n.id === 'a')?.read).toBe(true)
    expect(router.state.location.pathname).toBe('/places/oido')
  })

  it('뒤로가기 → 홈', async () => {
    const { user, router } = renderPage()
    await user.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('알림이 없으면 빈 상태를 보여준다', () => {
    useHomeStore.setState({ notifications: [] })
    renderPage()
    expect(screen.getByText('아직 받은 알림이 없어요')).toBeInTheDocument()
  })
})
