import { buildCalendar } from './calendar'
import { filterRecords } from './filter'
import {
  formatDistance,
  formatDuration,
  formatKoreanDate,
  formatListDate,
  formatPlaylistMeta,
} from './format'

describe('format', () => {
  it('거리: 소수점이 있으면 한 자리, 정수면 그대로 + km', () => {
    expect(formatDistance(43.3)).toBe('43.3km')
    expect(formatDistance(212)).toBe('212km')
    expect(formatDistance(28.74)).toBe('28.7km')
  })

  it('주행 시간: 시간/분 조합', () => {
    expect(formatDuration(80)).toBe('1시간 20분')
    expect(formatDuration(40)).toBe('40분')
    expect(formatDuration(120)).toBe('2시간')
  })

  it('한국어 날짜', () => {
    expect(formatKoreanDate('2026-11-03')).toBe('2026년 11월 3일')
  })

  it('목록용 날짜 블록 (연/월.일/요일)', () => {
    expect(formatListDate('2026-11-03')).toEqual({ year: '2026년', monthDay: '11.03', weekday: '화' })
    expect(formatListDate('2026-10-24')).toEqual({ year: '2026년', monthDay: '10.24', weekday: '토' })
  })

  it('플레이리스트 메타', () => {
    expect(formatPlaylistMeta(13)).toBe('총 13곡  ·  약 00분')
    expect(formatPlaylistMeta(13, 60)).toBe('총 13곡  ·  약 1시간')
  })
})

describe('buildCalendar', () => {
  it('2026년 10월은 목요일에 시작해 5주로 구성된다', () => {
    const weeks = buildCalendar(2026, 10)
    expect(weeks).toHaveLength(5)
    expect(weeks[0]).toEqual([null, null, null, null, 1, 2, 3])
    expect(weeks[4]).toEqual([25, 26, 27, 28, 29, 30, 31])
  })

  it('마지막 주는 null 로 채운다', () => {
    const weeks = buildCalendar(2026, 11)
    expect(weeks[0][0]).toBe(1) // 11/1 은 일요일
    expect(weeks[weeks.length - 1]).toHaveLength(7)
    expect(weeks.flat().filter(Boolean)).toHaveLength(30)
  })
})

describe('filterRecords', () => {
  const records = [
    { id: '1', title: '우리의 첫 바다 드라이브', place: '시흥 오이도', date: '2026-11-03' },
    { id: '2', title: '반짝이는 야경 드라이브', place: '서울 반포 한강공원', date: '2026-10-26' },
    { id: '3', title: '가을바다 힐링 드라이브', place: '강릉 경포대', date: '2026-10-24' },
  ]

  it('검색어가 제목 또는 장소에 포함된 기록만 남긴다 (공백 무시)', () => {
    expect(filterRecords(records, { query: '바다' }).map((r) => r.id)).toEqual(['1', '3'])
    expect(filterRecords(records, { query: '한강 공원' }).map((r) => r.id)).toEqual(['2'])
  })

  it('날짜로 필터링한다', () => {
    expect(filterRecords(records, { date: '2026-10-24' }).map((r) => r.id)).toEqual(['3'])
  })

  it('조건이 없으면 전부 반환한다', () => {
    expect(filterRecords(records, {})).toHaveLength(3)
    expect(filterRecords(records, { query: '  ' })).toHaveLength(3)
  })
})
