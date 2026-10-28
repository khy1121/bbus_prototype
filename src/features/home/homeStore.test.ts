import { vi } from 'vitest'
import { useHomeStore } from './homeStore'

vi.mock('./api', () => ({
  fetchNotifications: vi.fn(async () => [
    { id: 'a', senderName: '민지', title: 't', description: 'd', receivedAt: new Date().toISOString(), read: false, placeId: 'oido' },
    { id: 'b', senderName: '민지', title: 't', description: 'd', receivedAt: new Date().toISOString(), read: true, placeId: 'banpo' },
  ]),
  markNotificationRead: vi.fn(async () => {}),
  setPlaceLiked: vi.fn(async () => {}),
}))

describe('homeStore', () => {
  beforeEach(() => useHomeStore.setState({ likedIds: [], notifications: null }))

  it('찜 토글', () => {
    useHomeStore.getState().toggleLike('oido')
    expect(useHomeStore.getState().likedIds).toContain('oido')
    useHomeStore.getState().toggleLike('oido')
    expect(useHomeStore.getState().likedIds).not.toContain('oido')
  })

  it('알림을 불러오고, 읽음 처리하면 hasUnread 가 false 가 된다', async () => {
    await useHomeStore.getState().loadNotifications()
    expect(useHomeStore.getState().hasUnread()).toBe(true)
    useHomeStore.getState().markRead('a')
    expect(useHomeStore.getState().notifications?.find((n) => n.id === 'a')?.read).toBe(true)
    expect(useHomeStore.getState().hasUnread()).toBe(false)
  })
})
