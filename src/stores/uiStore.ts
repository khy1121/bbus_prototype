import { create } from 'zustand'
import type { Destination } from './driveStore'

/** 전역 UI 상태 — 어디서든 드라이브명 입력 팝업을 열 수 있게 한다 */
type UiState = {
  driveStart: { open: boolean; destination: Destination | null }
  openDriveStart: (destination?: Destination | null) => void
  closeDriveStart: () => void
}

export const useUiStore = create<UiState>((set) => ({
  driveStart: { open: false, destination: null },
  openDriveStart: (destination = null) => set({ driveStart: { open: true, destination } }),
  closeDriveStart: () => set({ driveStart: { open: false, destination: null } }),
}))
