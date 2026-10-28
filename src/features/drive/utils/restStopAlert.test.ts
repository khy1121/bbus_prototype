import { findRestStopAlert, formatAlertDistance, REST_STOP_ALERT_KM, restStopOffsetsKm } from './restStopAlert'
import type { DriveRoute, RestStop } from '../types'

const stop = (id: string, lat: number): RestStop => ({
  id,
  name: `${id}휴게소`,
  highway: '',
  description: '',
  position: { lat, lng: 127 },
  menus: [],
  stampColor: 'orange',
})

// 경로: 위도 0 → 10 일직선, 총 100km. 휴게소는 30km / 60km 지점
const route: DriveRoute = {
  path: Array.from({ length: 11 }, (_, i) => ({ lat: i, lng: 127 })),
  restStops: [stop('A', 3), stop('B', 6)],
  distanceKm: 100,
  durationMin: 120,
}

describe('restStopOffsetsKm', () => {
  it('각 휴게소의 출발지 기준 경로상 거리(km)를 구한다', () => {
    expect(restStopOffsetsKm(route)).toEqual([
      { stop: route.restStops[0], offsetKm: 30 },
      { stop: route.restStops[1], offsetKm: 60 },
    ])
  })
})

describe('findRestStopAlert', () => {
  it(`휴게소까지 ${REST_STOP_ALERT_KM}km 보다 멀면 알림이 없다`, () => {
    expect(findRestStopAlert(route, 20, [])).toBeNull()
  })

  it(`${REST_STOP_ALERT_KM}km 이내로 다가오면 남은 거리와 함께 알린다`, () => {
    expect(findRestStopAlert(route, 28.5, [])).toEqual({ stop: route.restStops[0], remainingKm: 1.5 })
  })

  it('휴게소를 지나치면 자동으로 사라진다', () => {
    expect(findRestStopAlert(route, 30.2, [])).toBeNull()
  })

  it('닫은 휴게소는 다시 알리지 않는다 (중복 알림 방지)', () => {
    expect(findRestStopAlert(route, 29, ['A'])).toBeNull()
  })

  it('다음 휴게소에 다가가면 새로 알린다', () => {
    expect(findRestStopAlert(route, 58, ['A'])?.stop.id).toBe('B')
  })
})

describe('formatAlertDistance', () => {
  it('1km 이상은 소수 첫째 자리 km (정수면 소수점 생략)', () => {
    expect(formatAlertDistance(2)).toBe('2km')
    expect(formatAlertDistance(1.46)).toBe('1.5km')
  })

  it('1km 미만은 100m 단위', () => {
    expect(formatAlertDistance(0.84)).toBe('800m')
    expect(formatAlertDistance(0.04)).toBe('100m')
  })
})
