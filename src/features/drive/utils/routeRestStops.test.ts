import { restStopsOnRoute, samplePointsAlongPath, type RestStopPlace } from './routeRestStops'

// 서울 → 남쪽으로 곧게 내려가는 약 33km 경로 (경도 고정)
const path = [
  { lat: 37.5, lng: 127.1 },
  { lat: 37.35, lng: 127.1 },
  { lat: 37.2, lng: 127.1 },
]
// 남쪽 진행 시 오른쪽 = 서쪽(경도가 작은 쪽)
const place = (id: string, name: string, lat: number, lng: number): RestStopPlace => ({
  id,
  name,
  highway: '경부고속도로',
  position: { lat, lng },
})

describe('경로 위 휴게소', () => {
  it('경로를 따라 일정 간격으로 검색 지점을 뽑는다 (시작·끝 포함)', () => {
    const points = samplePointsAlongPath(path, 10)
    expect(points[0]).toEqual(path[0])
    expect(points[points.length - 1]).toEqual(path[2])
    expect(points).toHaveLength(5) // 0, 10, 20, 30km + 끝(33km)
  })

  it('긴 경로는 검색 지점 수를 제한한다', () => {
    const long = [
      { lat: 37.5, lng: 127.1 },
      { lat: 35.1, lng: 129.0 },
    ]
    expect(samplePointsAlongPath(long, 10, 40).length).toBeLessThanOrEqual(40)
  })

  it('경로선에서 가까운 휴게소만, 경로 순서대로 고른다', () => {
    const stops = restStopsOnRoute(path, [
      place('far', '먼휴게소', 37.3, 127.2), // 약 9km 떨어짐
      place('b', '안성휴게소 부산방향', 37.25, 127.0985),
      place('a', '기흥휴게소 부산방향', 37.4, 127.0985),
    ])
    expect(stops.map((s) => s.name)).toEqual(['기흥휴게소 부산방향', '안성휴게소 부산방향'])
    expect(stops[0]).toMatchObject({ id: 'kakao-a', highway: '경부고속도로', position: { lat: 37.4, lng: 127.0985 } })
    expect(stops[0].menus.length).toBeGreaterThan(0)
  })

  it('양방향 휴게소는 진행 방향 오른쪽(우측 통행) 한 곳만 남긴다', () => {
    const stops = restStopsOnRoute(path, [
      place('up', '기흥휴게소 서울방향', 37.4, 127.1015), // 동쪽 = 남행 기준 왼쪽
      place('down', '기흥휴게소 부산방향', 37.4, 127.0985), // 서쪽 = 오른쪽
    ])
    expect(stops.map((s) => s.id)).toEqual(['kakao-down'])
  })

  it('출발지·목적지 바로 옆 휴게소는 제외한다', () => {
    const stops = restStopsOnRoute(path, [place('s', '출발휴게소', 37.4995, 127.0985)])
    expect(stops).toEqual([])
  })
})
