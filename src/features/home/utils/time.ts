import type { HomeNotification } from '../types'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** 알림 수신 시간 표시: 방금 전 / N분 전 / N시간 전 / N일 전 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime()
  if (diff < MINUTE) return '방금 전'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`
  return `${Math.floor(diff / DAY)}일 전`
}

/** 최근 7일 / 최근 30일로 나눈다. 30일이 지난 알림은 삭제된 것으로 보고 제외한다. */
export function groupNotifications(list: HomeNotification[], now: Date = new Date()) {
  const recent7: HomeNotification[] = []
  const recent30: HomeNotification[] = []
  const sorted = [...list].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
  for (const n of sorted) {
    const diff = now.getTime() - new Date(n.receivedAt).getTime()
    if (diff <= 7 * DAY) recent7.push(n)
    else if (diff <= 30 * DAY) recent30.push(n)
  }
  return { recent7, recent30 }
}
