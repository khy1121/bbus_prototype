import { vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { useDriveStore } from '@/stores/driveStore'
import { useDriveSessionStore } from '../stores/driveSessionStore'
import { renderDrive } from '../test-utils'
import { restStopOffsetsKm } from '../utils/restStopAlert'

const destination = { id: 'oido', name: '시흥 오이도', address: '경기 시흥시', position: { lat: 37.34, lng: 126.68 } }

describe('DrivePage (01 / 04 / 16)', () => {
  beforeEach(() => useDriveStore.getState().endDrive())

  it('idle 로 들어오면 드라이브를 시작하고 기본 이름을 보여준다', () => {
    renderDrive()
    expect(useDriveStore.getState().status).toBe('ready')
    expect(screen.getByRole('button', { name: /드라이브명 수정: 오늘의 드라이브/ })).toBeInTheDocument()
    expect(screen.getByText('-분 -초')).toBeInTheDocument()
  })

  it('드라이브명을 누르면 수정 팝업이 뜨고 수정이 반영된다', async () => {
    useDriveStore.getState().startDrive({ name: '바다' })
    const { user } = renderDrive()
    await user.click(screen.getByRole('button', { name: /드라이브명 수정/ }))
    const input = screen.getByRole('textbox', { name: '드라이브명' })
    await user.clear(input)
    await user.type(input, '우리의 첫 바다 드라이브')
    await user.click(screen.getByRole('button', { name: '수정 완료' }))
    expect(useDriveStore.getState().driveName).toBe('우리의 첫 바다 드라이브')
  })

  it('경로탐색 아이콘 → 장소 검색 화면', async () => {
    const { user, router } = renderDrive()
    await user.click(screen.getByRole('button', { name: '경로 탐색' }))
    expect(router.state.location.pathname).toBe('/drive/search')
  })

  it('나가기 → 드라이브 종료 시 홈으로 이동하고 드라이브가 끝난다', async () => {
    useDriveStore.getState().startDrive({ name: 'a', destination })
    const { user, router } = renderDrive()
    await user.click(screen.getByRole('button', { name: '드라이브 나가기' }))
    expect(screen.getByRole('dialog', { name: '드라이브를 마치시겠어요?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '드라이브 종료' }))
    expect(router.state.location.pathname).toBe('/')
    expect(useDriveStore.getState().status).toBe('idle')
  })

  it('나가기 → 경로 수정은 검색 화면으로', async () => {
    useDriveStore.getState().startDrive({ name: 'a', destination })
    const { user, router } = renderDrive()
    await user.click(screen.getByRole('button', { name: '드라이브 나가기' }))
    await user.click(screen.getByRole('button', { name: '경로 수정' }))
    expect(router.state.location.pathname).toBe('/drive/search')
  })

  it('주행 중단 → 기록 중단 안내, 화면 탭 시 재개', async () => {
    useDriveStore.getState().startDrive({ name: 'a', destination })
    const { user } = renderDrive()
    await user.click(screen.getByRole('button', { name: '주행 중단' }))
    expect(useDriveStore.getState().status).toBe('paused')
    expect(screen.getByText('기록이 중단되었어요.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /화면을 탭하면 주행을 다시 시작해요/ }))
    expect(useDriveStore.getState().status).toBe('driving')
  })

  it('휴게소 2km 이내로 다가가면 접근 알림(남은 거리)을 보여주고, 닫으면 다시 뜨지 않는다', async () => {
    useDriveStore.getState().startDrive({ name: 'a', destination })
    const { user } = renderDrive()
    await waitFor(() => expect(useDriveSessionStore.getState().route).not.toBeNull())
    expect(screen.queryByText(/전방 .* 앞에/)).not.toBeInTheDocument()

    // 첫 휴게소 1.5km 전 지점까지 주행한 상태로 만든다
    const route = useDriveSessionStore.getState().route!
    const [first] = restStopOffsetsKm(route)
    const traveledKm = first.offsetKm - 1.5
    act(() => useDriveSessionStore.setState({ elapsedSec: Math.round((traveledKm / route.distanceKm) * route.durationMin * 60) }))

    expect(await screen.findByText(new RegExp(`전방 1\\.\\dkm 앞에 ${first.stop.name}가 있어요`))).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '알림 닫기' }))
    expect(screen.queryByText(/전방 .* 앞에/)).not.toBeInTheDocument()
    expect(useDriveSessionStore.getState().dismissedRestStopIds).toContain(first.stop.id)
  })

  it('휴게소 스탬프 탭으로 전환한다', async () => {
    const { user } = renderDrive()
    await act(async () => {})
    await user.click(screen.getByRole('tab', { name: '휴게소 스탬프' }))
    expect(screen.getByRole('heading', { name: '휴게소 스탬프' })).toBeInTheDocument()
  })

  it('출발지를 장소로 정했으면 현재 위치를 묻지 않는다 (불필요한 위치 권한 팝업 방지)', async () => {
    const { locate } = await import('@/lib/location')
    const { resetLocationCache } = await import('../api')
    resetLocationCache()
    vi.mocked(locate).mockClear()
    vi.mocked(locate).mockRejectedValue(new Error('denied'))
    useDriveStore.getState().startDrive({ name: 'a', destination })
    useDriveStore.getState().setOrigin({ id: 'banpo', name: '서울 반포 한강공원', address: '', position: { lat: 37.51, lng: 126.99 } })
    renderDrive()
    await waitFor(() => expect(useDriveSessionStore.getState().route).not.toBeNull())
    expect(locate).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog', { name: '위치 권한이 필요해요' })).not.toBeInTheDocument()
    vi.mocked(locate).mockReset()
    vi.mocked(locate).mockResolvedValue({ lat: 37.4837, lng: 127.0324 })
  })
})
