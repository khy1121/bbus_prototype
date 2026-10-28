import {
  formatArrival,
  formatDistance,
  formatDriveTime,
  formatPlaylistDuration,
  formatTrackTime,
  splitHighlight,
  toggleLimited,
} from './format'

describe('drive format utils', () => {
  it('주행 시간: 값이 없으면 "-분 -초", 있으면 "32분 18초"', () => {
    expect(formatDriveTime(null)).toBe('-분 -초')
    expect(formatDriveTime(32 * 60 + 18)).toBe('32분 18초')
    expect(formatDriveTime(3 * 3600 + 5 * 60)).toBe('3시간 5분')
  })

  it('이동 거리: "-km" 또는 소수점 한 자리', () => {
    expect(formatDistance(null)).toBe('-km')
    expect(formatDistance(24.63)).toBe('24.6km')
  })

  it('예상 도착 시간: "-시 -분" 또는 "19시 47분"', () => {
    expect(formatArrival(null)).toBe('-시 -분')
    expect(formatArrival(new Date(2026, 9, 28, 19, 47))).toBe('19시 47분')
    expect(formatArrival(new Date(2026, 9, 28, 9, 5))).toBe('9시 05분')
  })

  it('곡 길이는 mm:ss', () => {
    expect(formatTrackTime(280)).toBe('04:40')
  })

  it('플레이리스트 총 길이는 "약 1시간 00분" / "약 45분"', () => {
    expect(formatPlaylistDuration(3600)).toBe('약 1시간 00분')
    expect(formatPlaylistDuration(45 * 60 + 20)).toBe('약 45분')
  })

  it('splitHighlight 는 검색어와 일치하는 부분을 표시한다', () => {
    expect(splitHighlight('서울 반포 한강공원', '한강공원')).toEqual([
      { text: '서울 반포 ', match: false },
      { text: '한강공원', match: true },
    ])
    expect(splitHighlight('강릉 헌화로', '')).toEqual([{ text: '강릉 헌화로', match: false }])
  })

  it('toggleLimited 는 최대 개수를 넘으면 추가하지 않는다', () => {
    expect(toggleLimited(['a'], 'b', 2)).toEqual(['a', 'b'])
    expect(toggleLimited(['a', 'b'], 'c', 2)).toEqual(['a', 'b'])
    expect(toggleLimited(['a', 'b'], 'a', 2)).toEqual(['b'])
  })
})
