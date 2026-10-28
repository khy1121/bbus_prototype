import { vi } from 'vitest'
import { buildRestStopSearchUrl, handleRestStopsRequest, isRestStopPlace, parsePointsParam } from './restStops'

const doc = (id: string, name: string, x: number, y: number, category = '교통,수송 > 휴게소 > 고속도로휴게소') => ({
  id,
  place_name: name,
  category_name: category,
  x: String(x),
  y: String(y),
  road_address_name: '경기 용인시 기흥구 경부고속도로 409',
  address_name: '경기 용인시 기흥구 공세동',
})

describe('카카오 로컬 휴게소 검색', () => {
  it('요청 URL: 키워드 "휴게소", 좌표는 x=경도·y=위도, 거리순', () => {
    const url = new URL(buildRestStopSearchUrl({ lat: 37.2, lng: 127.1 }, 8000, 2))
    expect(url.origin + url.pathname).toBe('https://dapi.kakao.com/v2/local/search/keyword.json')
    expect(url.searchParams.get('query')).toBe('휴게소')
    expect(url.searchParams.get('x')).toBe('127.1')
    expect(url.searchParams.get('y')).toBe('37.2')
    expect(url.searchParams.get('radius')).toBe('8000')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('sort')).toBe('distance')
  })

  it('points 파라미터는 "위도,경도|위도,경도" — 잘못된 값이나 너무 많은 점은 거부', () => {
    expect(parsePointsParam('37.1,127.1|37.2,127.2')).toEqual([
      { lat: 37.1, lng: 127.1 },
      { lat: 37.2, lng: 127.2 },
    ])
    expect(parsePointsParam('37.1,abc')).toBeNull()
    expect(parsePointsParam('')).toBeNull()
    expect(parsePointsParam(Array.from({ length: 61 }, () => '37,127').join('|'))).toBeNull()
  })

  it('휴게소만 남긴다 (휴게소 안 식당·주유소·졸음쉼터 제외)', () => {
    expect(isRestStopPlace(doc('1', '기흥휴게소 부산방향', 0, 0))).toBe(true)
    expect(isRestStopPlace(doc('2', '덕평자연휴게소', 0, 0, '교통,수송 > 휴게소'))).toBe(true)
    expect(isRestStopPlace(doc('3', '기흥휴게소 투썸플레이스', 0, 0, '음식점 > 카페'))).toBe(false)
    expect(isRestStopPlace(doc('4', '기흥휴게소 주유소', 0, 0, '교통,수송 > 자동차 > 주유,가스충전 > 주유소'))).toBe(false)
    expect(isRestStopPlace(doc('5', '오산졸음쉼터', 0, 0, '교통,수송 > 휴게소 > 졸음쉼터'))).toBe(false)
  })

  it('키가 없으면 503, 좌표가 잘못되면 400', async () => {
    expect((await handleRestStopsRequest(new URLSearchParams('points=37,127'), undefined)).status).toBe(503)
    expect((await handleRestStopsRequest(new URLSearchParams('points=x'), 'key')).status).toBe(400)
  })

  it('각 지점 주변을 검색해 중복 없이 휴게소 목록을 돌려준다 (다음 페이지까지)', async () => {
    const fetchMock = vi.fn(async (input: string, _init?: RequestInit) => {
      const url = new URL(input)
      const page = url.searchParams.get('page')
      if (url.searchParams.get('y') === '37.1' && page === '1')
        return Response.json({ documents: [doc('1', '기흥휴게소 부산방향', 127.1, 37.1)], meta: { is_end: false } })
      if (url.searchParams.get('y') === '37.1' && page === '2')
        return Response.json({
          documents: [doc('9', '기흥휴게소 투썸플레이스', 127.1, 37.1, '음식점 > 카페')],
          meta: { is_end: true },
        })
      return Response.json({
        documents: [doc('1', '기흥휴게소 부산방향', 127.1, 37.1), doc('2', '안성휴게소 부산방향', 127.2, 37.0)],
        meta: { is_end: true },
      })
    })
    const { status, body } = await handleRestStopsRequest(
      new URLSearchParams('points=37.1,127.1|37.0,127.2'),
      'key',
      fetchMock as unknown as typeof fetch,
    )
    expect(status).toBe(200)
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ headers: { Authorization: 'KakaoAK key' } })
    expect(body).toEqual({
      places: [
        { id: '1', name: '기흥휴게소 부산방향', highway: '경부고속도로', position: { lat: 37.1, lng: 127.1 } },
        { id: '2', name: '안성휴게소 부산방향', highway: '경부고속도로', position: { lat: 37.0, lng: 127.2 } },
      ],
    })
  })

  it('카카오 응답 오류는 502', async () => {
    const fetchMock = vi.fn(async () => new Response('', { status: 401 }))
    const res = await handleRestStopsRequest(
      new URLSearchParams('points=37,127'),
      'key',
      fetchMock as unknown as typeof fetch,
    )
    expect(res.status).toBe(502)
  })
})
