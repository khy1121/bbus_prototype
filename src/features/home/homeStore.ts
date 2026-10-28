import { create } from 'zustand'
import { fetchNotifications, markNotificationRead, setPlaceLiked } from './api'
import type { HomeNotification } from './types'

type HomeState = {
  likedIds: string[]
  toggleLike: (placeId: string) => void
  /** null = 아직 불러오지 않음 */
  notifications: HomeNotification[] | null
  loadNotifications: () => Promise<void>
  markRead: (notificationId: string) => void
  hasUnread: () => boolean
}

export const useHomeStore = create<HomeState>((set, get) => ({
  likedIds: [],
  toggleLike: (placeId) => {
    const liked = !get().likedIds.includes(placeId)
    set((s) => ({ likedIds: liked ? [...s.likedIds, placeId] : s.likedIds.filter((id) => id !== placeId) }))
    void setPlaceLiked(placeId, liked)
  },

  notifications: null,
  loadNotifications: async () => {
    const list = await fetchNotifications()
    set({ notifications: list })
  },
  markRead: (notificationId) => {
    set((s) => ({
      notifications: s.notifications?.map((n) => (n.id === notificationId ? { ...n, read: true } : n)) ?? null,
    }))
    void markNotificationRead(notificationId)
  },
  hasUnread: () => Boolean(get().notifications?.some((n) => !n.read)),
}))
