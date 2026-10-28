import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'
import { __resetMockRecords } from '../api'
import { mapRoutes, mapTabRoutes } from '../routes'

// 카카오맵 SDK 대신 마커 DOM 을 그대로 그리는 가짜 지도
vi.mock('@/components/KakaoMap/KakaoMap', async () => (await import('@/test/fakeKakaoMap')).fakeKakaoMapModule)

const desktop = vi.hoisted(() => ({ value: false }))
vi.mock('@/hooks/useMediaQuery', () => ({
  useIsDesktop: () => desktop.value,
  useMediaQuery: () => desktop.value,
}))

function renderAt(path: string) {
  const router = createMemoryRouter([...mapTabRoutes, ...mapRoutes, { path: '/', element: <p>home</p> }], {
    initialEntries: [path],
  })
  return { user: userEvent.setup(), router, ...render(<RouterProvider router={router} />) }
}

beforeEach(() => {
  __resetMockRecords()
  desktop.value = false
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 28, 12))
})
afterEach(() => vi.useRealTimers())

describe('RecordMapPage (/map)', () => {
  it('헤더에 총 드라이브 수와 제목을 보여준다', async () => {
    renderAt('/map')
    expect(await screen.findByText('총 12번의 드라이브를 함께했어요')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '우리 어디까지 가봤지?' })).toBeInTheDocument()
  })

  it('기본은 지도형 — 기록마다 마커가 있다', async () => {
    renderAt('/map')
    expect(await screen.findAllByRole('button', { name: /기록 보기$/ })).toHaveLength(12)
    expect(screen.getByRole('tab', { name: '지도형' })).toHaveAttribute('aria-selected', 'true')
  })

  it('마커 → 폴라로이드 카드 → 카드 클릭 시 상세로 이동', async () => {
    const { user, router } = renderAt('/map')
    await user.click(await screen.findByRole('button', { name: '우리의 첫 바다 드라이브 기록 보기' }))
    const dialog = screen.getByRole('dialog', { name: '우리의 첫 바다 드라이브' })
    expect(within(dialog).getByText('카드를 눌러 자세한 기록을 확인해 보세요.')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /우리의 첫 바다 드라이브/ }))
    expect(router.state.location.pathname).toBe('/map/cards/r01')
  })

  it('폴라로이드의 공유 → 인스타그램 선택 시 스토리 공유 화면으로 이동', async () => {
    const { user, router } = renderAt('/map')
    await user.click(await screen.findByRole('button', { name: '우리의 첫 바다 드라이브 기록 보기' }))
    await user.click(screen.getByRole('button', { name: '공유하기' }))
    await user.click(screen.getByRole('button', { name: '인스타그램' }))
    expect(router.state.location.pathname).toBe('/map/cards/r01/story')
  })

  it('목록형으로 전환하고 검색어로 필터링한다', async () => {
    const { user } = renderAt('/map')
    await user.click(await screen.findByRole('tab', { name: '목록형' }))
    const list = screen.getByRole('list', { name: '드라이브 기록 목록' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(12)

    await user.type(screen.getByRole('searchbox', { name: '드라이브 기록 검색' }), '바다')
    const titles = within(list)
      .getAllByRole('listitem')
      .map((li) => li.textContent)
    expect(titles.length).toBeGreaterThan(0)
    titles.forEach((t) => expect(t).toMatch(/바다/))
  })

  it('검색 결과가 없으면 빈 상태를 보여준다', async () => {
    const { user } = renderAt('/map')
    await user.click(await screen.findByRole('tab', { name: '목록형' }))
    await user.type(screen.getByRole('searchbox'), '없는장소')
    expect(screen.getByText('검색 결과가 없어요')).toBeInTheDocument()
  })

  it('달력에서 날짜를 고르면 검색창에 날짜가 표시되고 그 날의 기록만 남는다', async () => {
    const { user } = renderAt('/map')
    await user.click(await screen.findByRole('button', { name: '날짜로 검색' }))
    await user.click(screen.getByRole('button', { name: '10월 24일' }))
    expect(screen.queryByRole('dialog', { name: '날짜로 검색' })).not.toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('2026년 10월 24일')
    expect(screen.getAllByRole('button', { name: /기록 보기$/ })).toHaveLength(1)
  })

  it('데스크톱에서는 지도 + 우측 목록 패널을 함께 보여준다 (토글 없음)', async () => {
    desktop.value = true
    renderAt('/map')
    expect(await screen.findByRole('list', { name: '드라이브 기록 목록' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /기록 보기$/ })).toHaveLength(12)
    expect(screen.queryByRole('tab', { name: '목록형' })).not.toBeInTheDocument()
  })
})

describe('CardDetailPage (/map/cards/:id)', () => {
  it('기록 상세 정보를 보여준다', async () => {
    renderAt('/map/cards/r01')
    expect(await screen.findByRole('heading', { name: '2026년 11월 3일' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '우리의 첫 바다 드라이브' })).toBeInTheDocument()
    expect(screen.getByText('시흥 오이도')).toBeInTheDocument()
    expect(screen.getByText('43.3km')).toBeInTheDocument()
    expect(screen.getByText('노을처럼 따뜻한 우리')).toBeInTheDocument()
    expect(screen.getByText('운전자')).toBeInTheDocument()
    expect(screen.getByText('동승자')).toBeInTheDocument()
  })

  it('휴지통 → 삭제 확인 → 삭제하기 시 목록으로 돌아가고 기록이 사라진다', async () => {
    const { user, router } = renderAt('/map/cards/r01')
    await user.click(await screen.findByRole('button', { name: '삭제' }))
    expect(screen.getByRole('dialog', { name: '카드를 삭제하시겠어요?' })).toBeInTheDocument()
    expect(screen.getByText('삭제한 드라이브 기록은 복구할 수 없어요.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '삭제하기' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/map'))
    expect(await screen.findByText('총 11번의 드라이브를 함께했어요')).toBeInTheDocument()
  })

  it('삭제 확인에서 취소하면 팝업만 닫힌다', async () => {
    const { user, router } = renderAt('/map/cards/r01')
    await user.click(await screen.findByRole('button', { name: '삭제' }))
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/map/cards/r01')
  })

  it('없는 기록이면 안내를 보여준다', async () => {
    renderAt('/map/cards/nope')
    expect(await screen.findByText('기록을 찾을 수 없어요')).toBeInTheDocument()
  })
})

describe('StorySharePage (/map/cards/:id/story)', () => {
  it('스토리 미리보기에 카드와 내 스토리/친한 친구 버튼을 보여준다', async () => {
    renderAt('/map/cards/r01/story')
    expect(await screen.findByText('우리의 첫 바다 드라이브')).toBeInTheDocument()
    expect(screen.getByText('2026년 11월 3일')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '내 스토리' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '친한 친구' })).toBeInTheDocument()
  })

  it('닫기를 누르면 카드 상세로 돌아간다', async () => {
    const { user, router } = renderAt('/map/cards/r01/story')
    await user.click(await screen.findByRole('button', { name: '닫기' }))
    expect(router.state.location.pathname).toBe('/map/cards/r01')
  })
})
