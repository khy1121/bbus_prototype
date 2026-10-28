import { screen, within } from '@testing-library/react'
import { useDriveStore } from '@/stores/driveStore'
import { useDriveDataStore } from '../stores/driveDataStore'
import { renderDrive } from '../test-utils'

describe('SearchPage (02 / 03)', () => {
  beforeEach(() => {
    useDriveDataStore.getState().reset()
    useDriveStore.getState().endDrive()
    useDriveStore.getState().startDrive({ name: 'a' })
  })

  it('출발지는 내 위치(주소), 최근 검색어와 인기 경로를 보여준다', async () => {
    renderDrive('/drive/search')
    expect(await screen.findByText('(서초구 서초동)')).toBeInTheDocument()
    const recent = screen.getByRole('list', { name: '최근 검색어' })
    expect(within(recent).getByText('서울 반포 한강공원')).toBeInTheDocument()
    expect(within(recent).getByText('10.25')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '인기 드라이브 경로 BEST' })).toBeInTheDocument()
  })

  it('최근 검색어 삭제', async () => {
    const { user } = renderDrive('/drive/search')
    await user.click(screen.getByRole('button', { name: '서울 반포 한강공원 삭제' }))
    expect(screen.queryByText('서울 반포 한강공원')).not.toBeInTheDocument()
  })

  it('최근 검색어 탭 → 검색 결과 (일치 부분 강조)', async () => {
    const { user, router } = renderDrive('/drive/search')
    await user.click(screen.getByRole('button', { name: '서울 반포 한강공원' }))
    expect(router.state.location.search).toContain('q=')
    const results = await screen.findByRole('list', { name: '검색 결과' })
    expect(within(results).getByText('3.2km')).toBeInTheDocument()
    expect(within(results).getByText('서울 반포 한강공원', { selector: 'mark' })).toBeInTheDocument()
  })

  it('검색어 입력 후 엔터 → 결과, 최근 검색어에 추가', async () => {
    const { user } = renderDrive('/drive/search')
    await user.type(screen.getByRole('searchbox', { name: '도착지' }), '한강공원{Enter}')
    const results = await screen.findByRole('list', { name: '검색 결과' })
    expect(within(results).getAllByRole('listitem').length).toBeGreaterThan(3)
    expect(useDriveDataStore.getState().recentSearches[0].keyword).toBe('한강공원')
  })

  it('결과가 없으면 빈 상태를 보여준다', async () => {
    const { user } = renderDrive('/drive/search')
    await user.type(screen.getByRole('searchbox', { name: '도착지' }), '없는장소zzz{Enter}')
    expect(await screen.findByText('검색 결과가 없어요')).toBeInTheDocument()
  })

  it('결과 탭 → 경로 미리보기 → 경로 설정하기 → 드라이브 화면 + 목적지 설정', async () => {
    const { user, router } = renderDrive('/drive/search?q=오이도')
    await user.click(await screen.findByRole('button', { name: /시흥 오이도/ }))
    expect(router.state.location.pathname).toBe('/drive/route/oido')
    await user.click(await screen.findByRole('button', { name: '경로 설정하기' }))
    expect(router.state.location.pathname).toBe('/drive')
    expect(useDriveStore.getState().destination?.name).toBe('시흥 오이도')
    expect(useDriveStore.getState().status).toBe('driving')
  })

  it('X 버튼은 드라이브 화면으로 돌아간다', async () => {
    const { user, router } = renderDrive('/drive/search')
    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(router.state.location.pathname).toBe('/drive')
  })

  it('출발/도착 바꾸기', async () => {
    useDriveStore.getState().setDestination({ id: 'oido', name: '시흥 오이도', address: '', position: { lat: 0, lng: 0 } })
    const { user } = renderDrive('/drive/search')
    await screen.findByText('(서초구 서초동)')
    await user.click(screen.getByRole('button', { name: '출발지와 도착지 바꾸기' }))
    expect(screen.getByTestId('route-from')).toHaveTextContent('시흥 오이도')
  })
})
