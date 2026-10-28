import { bearingDeg, DIRECTIONS, headingAlongPath, toDirection } from './heading'

describe('bearingDeg (두 지점 사이 진행 방위각, 북=0° 시계방향)', () => {
  it.each([
    [{ lat: 37, lng: 127 }, { lat: 37.1, lng: 127 }, 0],
    [{ lat: 37, lng: 127 }, { lat: 37, lng: 127.1 }, 90],
    [{ lat: 37, lng: 127 }, { lat: 36.9, lng: 127 }, 180],
    [{ lat: 37, lng: 127 }, { lat: 37, lng: 126.9 }, 270],
  ])('%o → %o = %d°', (a, b, expected) => {
    expect(bearingDeg(a, b)).toBeCloseTo(expected, 0)
  })
})

describe('toDirection (8방향으로 반올림)', () => {
  it.each([
    [0, 'N'],
    [22, 'N'],
    [23, 'NE'],
    [90, 'E'],
    [135, 'SE'],
    [180, 'S'],
    [225, 'SW'],
    [270, 'W'],
    [315, 'NW'],
    [350, 'N'],
    [-10, 'N'],
  ])('%d° → %s', (deg, dir) => {
    expect(toDirection(deg)).toBe(dir)
  })

  it('8방향 목록', () => {
    expect(DIRECTIONS).toEqual(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'])
  })
})

describe('headingAlongPath (경로 위 현재 지점의 진행 방향)', () => {
  // 동쪽으로 가다가 북쪽으로 꺾는 경로
  const path = [
    { lat: 37, lng: 127 },
    { lat: 37, lng: 127.02 },
    { lat: 37.02, lng: 127.02 },
  ]

  it('앞으로 조금 더 간 지점을 바라보는 방향', () => {
    expect(toDirection(headingAlongPath(path, 0.5))).toBe('E')
    expect(toDirection(headingAlongPath(path, 2.5))).toBe('N')
  })

  it('경로 끝에서는 마지막 구간 방향을 유지한다', () => {
    expect(toDirection(headingAlongPath(path, 999))).toBe('N')
  })
})
