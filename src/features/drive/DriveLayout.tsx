import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDriveStore } from '@/stores/driveStore'
import { getRoute } from './api'
import { useDriveSessionStore } from './stores/driveSessionStore'

/**
 * '/drive' 공통 레이아웃
 * - 드라이브 모드가 꺼진 채로 들어오면 이름 없이 시작
 * - 목적지가 바뀌면 경로 조회, 주행 중이면 1초마다 진행 (서브 화면에 있어도 계속)
 */
export function DriveLayout() {
  const status = useDriveStore((s) => s.status)
  const destination = useDriveStore((s) => s.destination)
  const startDrive = useDriveStore((s) => s.startDrive)
  const { setRoute, tick, resetSession } = useDriveSessionStore()

  useEffect(() => {
    if (useDriveStore.getState().status === 'idle') startDrive({ name: '' })
  }, [startDrive])

  useEffect(() => {
    if (!destination) {
      resetSession()
      return
    }
    let cancelled = false
    getRoute(destination).then((route) => !cancelled && setRoute(route))
    return () => {
      cancelled = true
    }
  }, [destination, setRoute, resetSession])

  useEffect(() => {
    if (status !== 'driving') return
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [status, tick])

  return <Outlet />
}
