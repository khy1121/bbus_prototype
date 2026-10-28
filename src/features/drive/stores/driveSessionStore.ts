import { create } from 'zustand'
import type { DriveRoute } from '../types'

/**
 * 진행 중인 드라이브 세션 (경로 + 경과 시간).
 * TODO(backend/GPS): 실제 위치 추적 값으로 교체. 현재는 1초 타이머로 진행을 시뮬레이션한다.
 */
type DriveSessionState = {
  route: DriveRoute | null
  elapsedSec: number
  /** 접근 알림을 닫은 휴게소 (같은 휴게소 중복 알림 방지) */
  dismissedRestStopIds: string[]
  setRoute: (route: DriveRoute | null) => void
  tick: () => void
  dismissRestStopAlert: (restStopId: string) => void
  resetSession: () => void
}

export const useDriveSessionStore = create<DriveSessionState>((set) => ({
  route: null,
  elapsedSec: 0,
  dismissedRestStopIds: [],
  setRoute: (route) => set({ route, elapsedSec: 0, dismissedRestStopIds: [] }),
  tick: () => set((s) => ({ elapsedSec: s.elapsedSec + 1 })),
  dismissRestStopAlert: (restStopId) =>
    set((s) => ({ dismissedRestStopIds: [...s.dismissedRestStopIds, restStopId] })),
  resetSession: () => set({ route: null, elapsedSec: 0, dismissedRestStopIds: [] }),
}))

/** 경과 시간 기준 진행률 (0~1) */
export function routeProgress(route: DriveRoute, elapsedSec: number): number {
  const total = Math.max(route.durationMin * 60, 1)
  return Math.min(elapsedSec / total, 1)
}
