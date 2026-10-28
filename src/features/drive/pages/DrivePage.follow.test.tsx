import { act, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useDriveStore } from '@/stores/driveStore'
import { useDriveSessionStore } from '../stores/driveSessionStore'
import { renderDrive } from '../test-utils'
import { cumulativeKm } from '@/lib/geo'
import { headingAlongPath, toDirection } from '@/lib/heading'

vi.mock('@/components/KakaoMap/KakaoMap', async () => (await import('@/test/fakeKakaoMap')).fakeKakaoMapModule)

const destination = { id: 'oido', name: '시흥 오이도', address: '경기 시흥시', position: { lat: 37.34, lng: 126.68 } }
const mapCenter = () => screen.getByRole('region', { name: '드라이브 지도' }).getAttribute('data-center')
const advance = (sec: number) => act(() => useDriveSessionStore.setState((s) => ({ elapsedSec: s.elapsedSec + sec })))

describe('DrivePage — 차량 따라가기', () => {
  beforeEach(() => useDriveStore.getState().endDrive())

  it('운행 중에는 지도가 차량을 따라가고, 지도를 끌면 멈추고, 현재 위치 버튼으로 다시 따라간다', async () => {
    useDriveStore.getState().startDrive({ name: 'a', destination })
    const { user } = renderDrive()
    await waitFor(() => expect(useDriveSessionStore.getState().route).not.toBeNull())

    const start = mapCenter()
    advance(300)
    const moved = mapCenter()
    expect(moved).not.toBe(start) // 차량 따라감

    await user.click(screen.getByRole('button', { name: '지도 끌기' }))
    advance(300)
    expect(mapCenter()).toBe(moved) // 사용자가 움직인 뒤에는 고정

    await user.click(screen.getByRole('button', { name: '현재 위치' }))
    await waitFor(() => expect(mapCenter()).not.toBe(moved)) // 다시 차량 위치로
  })

  it('차량 마커는 경로상 진행 방향(8방향)에 맞는 이미지를 쓴다', async () => {
    useDriveStore.getState().startDrive({ name: 'a', destination })
    renderDrive()
    await waitFor(() => expect(useDriveSessionStore.getState().route).not.toBeNull())
    advance(120)
    const car = await screen.findByRole('img', { name: '현재 위치' })
    const route = useDriveSessionStore.getState().route!
    const { routeProgress } = await import('../stores/driveSessionStore')
    const km = cumulativeKm(route.path).at(-1)! * routeProgress(route, useDriveSessionStore.getState().elapsedSec)
    expect(car).toHaveAttribute('data-direction', toDirection(headingAlongPath(route.path, km)))
  })
})
