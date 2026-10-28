import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'
import { routes } from './router'

vi.mock('@/components/KakaoMap/KakaoMap', async () => (await import('@/test/fakeKakaoMap')).fakeKakaoMapModule)

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

// 화면별 코드는 지연 로딩(code splitting)된다 — 실제 앱 라우터로 각 영역이 정상 렌더링되는지 확인
describe('app router (지연 로딩 경계)', () => {
  it.each([
    ['/', { role: 'heading', name: '오늘은 어디로 떠나볼까요?' }],
    ['/notifications', { role: 'heading', name: '알림' }],
    ['/places/oido', { role: 'heading', name: '시흥 오이도' }],
    ['/map', { role: 'heading', name: '우리 어디까지 가봤지?' }],
    ['/map/cards/r01', { role: 'heading', name: '우리의 첫 바다 드라이브' }],
    ['/drive/search', { role: 'searchbox', name: '도착지' }],
    ['/drive/radio', { role: 'heading', name: '사연 입력하기' }],
    ['/my', { role: 'heading', name: '마이' }],
  ] as const)('%s', async (path, { role, name }) => {
    renderAt(path)
    expect(await screen.findByRole(role, { name }, { timeout: 3000 })).toBeInTheDocument()
  })

  it('/couple/invite (준비 중 화면)', async () => {
    renderAt('/couple/invite')
    expect(await screen.findByText('커플 코드 입력 및 초대', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})
