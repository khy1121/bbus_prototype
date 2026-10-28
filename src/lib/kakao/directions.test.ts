import { vi } from 'vitest'
import { buildDirectionsUrl, handleDirectionsRequest, parseDirections, parseLatLngParam } from './directions'

const sample = {
  routes: [
    {
      result_code: 0,
      result_msg: '길찾기 성공',
      summary: { distance: 24600, duration: 1938 },
      sections: [
        {
          roads: [
            { vertexes: [127.03, 37.48, 127.02, 37.49] },
            { vertexes: [127.01, 37.5, 126.99, 37.51] },
          ],
        },
      ],
    },
  ],
}

describe('카카오모빌리티 길찾기', () => {
  it('요청 URL: 좌표는 "경도,위도" 순서, 추천 경로', () => {
    const url = new URL(buildDirectionsUrl({ lat: 37.48, lng: 127.03 }, { lat: 37.51, lng: 126.99 }))
    expect(url.origin + url.pathname).toBe('https://apis-navi.kakaomobility.com/v1/directions')
    expect(url.searchParams.get('origin')).toBe('127.03,37.48')
    expect(url.searchParams.get('destination')).toBe('126.99,37.51')
    expect(url.searchParams.get('priority')).toBe('RECOMMEND')
  })

  it('응답의 vertexes(경도,위도 반복)를 도로 순서대로 이어 경로 좌표로 만든다', () => {
    const route = parseDirections(sample)
    expect(route.path).toEqual([
      { lat: 37.48, lng: 127.03 },
      { lat: 37.49, lng: 127.02 },
      { lat: 37.5, lng: 127.01 },
      { lat: 37.51, lng: 126.99 },
    ])
    expect(route.distanceKm).toBeCloseTo(24.6)
    expect(route.durationMin).toBe(32)
  })

  it('길찾기 실패(result_code ≠ 0)면 에러', () => {
    expect(() => parseDirections({ routes: [{ result_code: 104, result_msg: '출발지와 도착지가 5m 이내' }] })).toThrow(
      /5m/,
    )
  })

  it('쿼리 좌표 검증: "위도,경도" 숫자만 허용 (프록시 오남용 방지)', () => {
    expect(parseLatLngParam('37.5,127.03')).toEqual({ lat: 37.5, lng: 127.03 })
    expect(parseLatLngParam('abc')).toBeNull()
    expect(parseLatLngParam('91,127')).toBeNull()
    expect(parseLatLngParam(null)).toBeNull()
  })
})

describe('handleDirectionsRequest (서버 프록시)', () => {
  const q = (s: string) => new URLSearchParams(s)

  it('REST 키가 없으면 503', async () => {
    const r = await handleDirectionsRequest(q('origin=37.4,127&destination=37.5,127'), undefined)
    expect(r.status).toBe(503)
  })

  it('좌표가 잘못되면 400 (외부 호출 안 함)', async () => {
    const fetchImpl = vi.fn()
    const r = await handleDirectionsRequest(q('origin=hack&destination=37.5,127'), 'k', fetchImpl)
    expect(r.status).toBe(400)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('정상이면 KakaoAK 헤더로 호출하고 파싱 결과를 돌려준다', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => sample })
    const r = await handleDirectionsRequest(q('origin=37.48,127.03&destination=37.51,126.99'), 'secret', fetchImpl)
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('KakaoAK secret')
    expect(r.status).toBe(200)
    expect((r.body as { path: unknown[] }).path).toHaveLength(4)
  })
})
