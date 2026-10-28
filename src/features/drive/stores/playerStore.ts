import { create } from 'zustand'
import type { Playlist, PlaylistPreference } from '../types'

/**
 * DJ 플레이리스트 재생 상태.
 * TODO(backend): 실제 음악 서비스 SDK 재생 제어로 교체 (현재는 UI 상태만 관리)
 */
type PlayerState = {
  playlist: Playlist | null
  preference: PlaylistPreference | null
  currentIndex: number
  isPlaying: boolean
  /** all: 전체 재생 / single: 곡 탭 단일 재생 */
  mode: 'all' | 'single'
  saved: boolean
  /** 재생을 한 번이라도 시작했는지 (드라이브 화면 재생 카드 노출 기준) */
  started: boolean
  setPlaylist: (playlist: Playlist, preference?: PlaylistPreference) => void
  playAll: () => void
  playSingle: (index: number) => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  removeTrack: (trackId: string) => void
  moveTrack: (from: number, to: number) => void
  toggleSaved: () => void
  reset: () => void
}

const initial = {
  playlist: null,
  preference: null,
  currentIndex: 0,
  isPlaying: false,
  mode: 'all' as const,
  saved: false,
  started: false,
}

export const usePlayerStore = create<PlayerState>((set) => ({
  ...initial,

  setPlaylist: (playlist, preference) =>
    set((s) => ({ playlist, preference: preference ?? s.preference, currentIndex: 0, isPlaying: false, saved: false, started: false })),

  playAll: () => set({ currentIndex: 0, isPlaying: true, mode: 'all', started: true }),

  playSingle: (index) => set({ currentIndex: index, isPlaying: true, mode: 'single', started: true }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () =>
    set((s) => {
      const len = s.playlist?.tracks.length ?? 0
      return len ? { currentIndex: (s.currentIndex + 1) % len } : s
    }),

  prev: () =>
    set((s) => {
      const len = s.playlist?.tracks.length ?? 0
      return len ? { currentIndex: (s.currentIndex - 1 + len) % len } : s
    }),

  removeTrack: (trackId) =>
    set((s) => {
      if (!s.playlist) return s
      const tracks = s.playlist.tracks.filter((t) => t.id !== trackId)
      return {
        playlist: { ...s.playlist, tracks },
        currentIndex: Math.min(s.currentIndex, Math.max(tracks.length - 1, 0)),
      }
    }),

  moveTrack: (from, to) =>
    set((s) => {
      if (!s.playlist || from === to) return s
      const tracks = [...s.playlist.tracks]
      const [moved] = tracks.splice(from, 1)
      tracks.splice(to, 0, moved)
      return { playlist: { ...s.playlist, tracks } }
    }),

  toggleSaved: () => set((s) => ({ saved: !s.saved })),

  reset: () => set(initial),
}))
