import { create } from 'zustand'
import type { LatLng } from '@/components/KakaoMap/KakaoMap'

export const DEFAULT_DRIVE_NAME = '오늘의 드라이브'

export type Destination = {
  id: string
  name: string
  address: string
  position: LatLng
}

/**
 * idle: 드라이브 모드 OFF
 * ready: 드라이브 모드 ON, 목적지 미설정 (01 첫 진입)
 * driving: 경로 안내 중 (04)
 * paused: 주행 중단 (16)
 */
export type DriveStatus = 'idle' | 'ready' | 'driving' | 'paused'

type DriveState = {
  status: DriveStatus
  driveName: string
  destination: Destination | null
  startDrive: (params: { name: string; destination?: Destination | null }) => void
  renameDrive: (name: string) => void
  setDestination: (destination: Destination) => void
  pause: () => void
  resume: () => void
  endDrive: () => void
}

const normalizeName = (name: string) => name.trim() || DEFAULT_DRIVE_NAME

export const useDriveStore = create<DriveState>((set) => ({
  status: 'idle',
  driveName: DEFAULT_DRIVE_NAME,
  destination: null,

  startDrive: ({ name, destination = null }) =>
    set({ status: destination ? 'driving' : 'ready', driveName: normalizeName(name), destination }),

  renameDrive: (name) => set({ driveName: normalizeName(name) }),

  setDestination: (destination) => set({ destination, status: 'driving' }),

  pause: () => set((s) => (s.status === 'driving' ? { status: 'paused' } : s)),

  resume: () => set((s) => (s.status === 'paused' ? { status: 'driving' } : s)),

  endDrive: () => set({ status: 'idle', driveName: DEFAULT_DRIVE_NAME, destination: null }),
}))
