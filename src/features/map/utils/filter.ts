type Filterable = { title: string; place: string; date: string }

const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase()

/** 제목/장소 검색 + 날짜 필터 */
export function filterRecords<T extends Filterable>(records: T[], { query, date }: { query?: string; date?: string | null }): T[] {
  const q = normalize(query ?? '')
  return records.filter((r) => {
    if (date && r.date !== date) return false
    if (q && !normalize(r.title).includes(q) && !normalize(r.place).includes(q)) return false
    return true
  })
}
