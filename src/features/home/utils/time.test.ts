import { formatRelativeTime, groupNotifications } from './time'

const now = new Date('2026-11-03T12:00:00')
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString()

describe('formatRelativeTime', () => {
  it('1분 미만은 "방금 전"', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 20_000).toISOString(), now)).toBe('방금 전')
  })
  it('분/시간/일 단위로 표시한다', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60_000).toISOString(), now)).toBe('5분 전')
    expect(formatRelativeTime(hoursAgo(17), now)).toBe('17시간 전')
    expect(formatRelativeTime(hoursAgo(24), now)).toBe('1일 전')
    expect(formatRelativeTime(hoursAgo(24 * 8), now)).toBe('8일 전')
  })
})

describe('groupNotifications', () => {
  const base = { senderName: '민준', title: 't', description: 'd', read: false, placeId: 'oido' }
  it('최근 7일 / 최근 30일로 나누고 30일이 지난 알림은 제외한다', () => {
    const list = [
      { ...base, id: 'a', receivedAt: hoursAgo(17) },
      { ...base, id: 'b', receivedAt: hoursAgo(24 * 8) },
      { ...base, id: 'c', receivedAt: hoursAgo(24 * 31) },
      { ...base, id: 'd', receivedAt: hoursAgo(24 * 2) },
    ]
    const { recent7, recent30 } = groupNotifications(list, now)
    expect(recent7.map((n) => n.id)).toEqual(['a', 'd'])
    expect(recent30.map((n) => n.id)).toEqual(['b'])
  })
})
