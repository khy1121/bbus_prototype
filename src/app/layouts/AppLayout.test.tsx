import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { useDriveStore } from '@/stores/driveStore'
import { AppLayout, TabLayout } from './AppLayout'

function renderApp(initial = '/') {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout />,
        children: [
          { element: <TabLayout />, children: [{ path: '/', element: <p>홈 화면</p> }] },
          { path: '/drive', element: <p>드라이브 화면</p> },
        ],
      },
    ],
    { initialEntries: [initial] },
  )
  return { user: userEvent.setup(), router, ...render(<RouterProvider router={router} />) }
}

describe('AppLayout', () => {
  beforeEach(() => useDriveStore.getState().endDrive())

  it('모바일 탭 화면에 하단 네비를 보여준다', () => {
    renderApp()
    expect(screen.getByText('홈 화면')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '하단 메뉴' })).toBeInTheDocument()
  })

  it('드라이브 버튼 → 드라이브명 입력 → 출발 시 드라이브 모드로 이동한다', async () => {
    const { user, router } = renderApp()
    await user.click(screen.getByRole('button', { name: '드라이브' }))
    await user.type(screen.getByRole('textbox', { name: '드라이브명' }), '우리의 첫 바다 드라이브')
    await user.click(screen.getByRole('button', { name: /출발/ }))

    expect(router.state.location.pathname).toBe('/drive')
    expect(useDriveStore.getState().driveName).toBe('우리의 첫 바다 드라이브')
    expect(useDriveStore.getState().status).toBe('ready')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
