const pad = (n: number) => String(n).padStart(2, '0')

/** 주행 시간 (초) → "32분 18초" / 1시간 이상 "3시간 5분" */
export function formatDriveTime(seconds: number | null): string {
  if (seconds === null) return '-분 -초'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return h > 0 ? `${h}시간 ${m}분` : `${m}분 ${s}초`
}

export function formatDistance(km: number | null): string {
  return km === null ? '-km' : `${km.toFixed(1)}km`
}

export function formatArrival(date: Date | null): string {
  return date === null ? '-시 -분' : `${date.getHours()}시 ${pad(date.getMinutes())}분`
}

export function formatTrackTime(seconds: number): string {
  return `${pad(Math.floor(seconds / 60))}:${pad(Math.floor(seconds % 60))}`
}

export function formatPlaylistDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `약 ${h}시간 ${pad(m)}분` : `약 ${m}분`
}

export type HighlightPart = { text: string; match: boolean }

/** 검색어와 일치하는 부분을 표시하기 위해 문자열을 나눈다 (첫 일치만) */
export function splitHighlight(text: string, query: string): HighlightPart[] {
  const q = query.trim()
  const index = q ? text.indexOf(q) : -1
  if (index < 0) return [{ text, match: false }]
  return [
    { text: text.slice(0, index), match: false },
    { text: q, match: true },
    { text: text.slice(index + q.length), match: false },
  ].filter((p) => p.text)
}

/** 선택 토글 — 최대 개수를 넘으면 추가하지 않는다 */
export function toggleLimited<T>(list: T[], value: T, max: number): T[] {
  if (list.includes(value)) return list.filter((v) => v !== value)
  return list.length >= max ? list : [...list, value]
}

export function formatMonthDay(date: Date): string {
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}
