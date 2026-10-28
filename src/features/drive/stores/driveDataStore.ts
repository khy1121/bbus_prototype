import { create } from 'zustand'
import { MOCK_RECENT_SEARCHES, MOCK_STAMPS, MOCK_STORIES } from '../mocks'
import type { RadioStory, RecentSearch } from '../types'
import { formatMonthDay } from '../utils/format'

export const MAX_RECENT_SEARCHES = 30

/**
 * 드라이브 모드 로컬 데이터 (최근 검색어, 스탬프, 보낸 사연).
 * TODO(backend): 서버 저장/동기화로 교체
 */
type DriveDataState = {
  recentSearches: RecentSearch[]
  /** restStopId → 획득 일시(ISO) */
  stamps: Record<string, string>
  stories: RadioStory[]
  addRecentSearch: (keyword: string, now?: Date) => void
  removeRecentSearch: (id: string) => void
  acquireStamp: (restStopId: string, now?: Date) => void
  addStory: (story: RadioStory) => void
  reset: () => void
}

let seq = 0

const initial = () => ({
  recentSearches: [...MOCK_RECENT_SEARCHES],
  stamps: { ...MOCK_STAMPS },
  stories: [...MOCK_STORIES],
})

export const useDriveDataStore = create<DriveDataState>((set) => ({
  ...initial(),

  addRecentSearch: (keyword, now = new Date()) =>
    set((s) => {
      const k = keyword.trim()
      if (!k) return s
      const next = [
        { id: `rs-${Date.now()}-${seq++}`, keyword: k, date: formatMonthDay(now) },
        ...s.recentSearches.filter((r) => r.keyword !== k),
      ]
      return { recentSearches: next.slice(0, MAX_RECENT_SEARCHES) }
    }),

  removeRecentSearch: (id) => set((s) => ({ recentSearches: s.recentSearches.filter((r) => r.id !== id) })),

  acquireStamp: (restStopId, now = new Date()) =>
    set((s) => ({ stamps: { ...s.stamps, [restStopId]: s.stamps[restStopId] ?? now.toISOString() } })),

  addStory: (story) => set((s) => ({ stories: [story, ...s.stories] })),

  reset: () => set(initial()),
}))
