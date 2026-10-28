const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

function parseDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d, weekday: WEEKDAYS[new Date(y, m - 1, d).getDay()] }
}

export function formatDistance(km: number): string {
  const rounded = Math.round(km * 10) / 10
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}km`
}

export function formatDuration(totalMin: number): string {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (!h) return `${m}분`
  return m ? `${h}시간 ${m}분` : `${h}시간`
}

/** 2026-11-03 → 2026년 11월 3일 */
export function formatKoreanDate(iso: string): string {
  const { y, m, d } = parseDate(iso)
  return `${y}년 ${m}월 ${d}일`
}

/** 목록 좌측 날짜 블록 */
export function formatListDate(iso: string) {
  const { y, m, d, weekday } = parseDate(iso)
  return { year: `${y}년`, monthDay: `${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`, weekday }
}

/** 총 13곡  ·  약 00분 (재생 시간 미정이면 00분) */
export function formatPlaylistMeta(trackCount: number, durationMin?: number): string {
  const duration = durationMin === undefined ? '00분' : formatDuration(durationMin)
  return `총 ${trackCount}곡  ·  약 ${duration}`
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
