import { cumulativeKm, haversineKm, pointAtKm } from './geo'

// 경도 1도 ≈ 적도에서 111.19km
const line = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 1 },
  { lat: 0, lng: 3 },
]

describe('geo', () => {
  it('haversineKm: 두 좌표 사이 거리(km)', () => {
    expect(haversineKm(line[0], line[1])).toBeCloseTo(111.19, 1)
  })

  it('cumulativeKm: 경로 시작점부터 각 점까지 누적 거리', () => {
    const acc = cumulativeKm(line)
    expect(acc[0]).toBe(0)
    expect(acc[1]).toBeCloseTo(111.19, 1)
    expect(acc[2]).toBeCloseTo(333.58, 1)
  })

  it('pointAtKm: 점 간격이 고르지 않아도 실제 거리 기준으로 위치를 보간한다', () => {
    const p = pointAtKm(line, 222.39)
    expect(p.lat).toBeCloseTo(0)
    expect(p.lng).toBeCloseTo(2, 2)
  })

  it('pointAtKm: 범위를 벗어나면 양 끝점', () => {
    expect(pointAtKm(line, -5)).toEqual(line[0])
    expect(pointAtKm(line, 9999)).toEqual(line[2])
  })
})
