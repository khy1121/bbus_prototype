import { vi } from 'vitest'
import {
  generatePlaylist,
  getBalanceQuestions,
  getRestStops,
  getRoute,
  getQuizQuestions,
  searchPlaces,
  sendStory,
} from './api'

describe('drive api (mock)', () => {
  it('searchPlaces 는 검색어가 포함된 장소를 거리순으로 돌려준다', async () => {
    const result = await searchPlaces('한강공원')
    expect(result.length).toBeGreaterThan(1)
    expect(result.every((p) => p.name.includes('한강공원'))).toBe(true)
    const distances = result.map((p) => p.distanceKm)
    expect([...distances].sort((a, b) => a - b)).toEqual(distances)
  })

  it('검색 결과가 없으면 빈 배열', async () => {
    expect(await searchPlaces('없는장소zzz')).toEqual([])
  })

  describe('getRoute (카카오모빌리티 길찾기)', () => {
    afterEach(() => vi.unstubAllGlobals())

    it('/api/directions 의 실제 도로 경로를 쓰고, 휴게소를 경로 위에 배치한다', async () => {
      const roadPath = [
        { lat: 37.48, lng: 127.03 },
        { lat: 37.45, lng: 126.95 },
        { lat: 37.4, lng: 126.85 },
        { lat: 37.35, lng: 126.7 },
      ]
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ path: roadPath, distanceKm: 42.3, durationMin: 51 }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const route = await getRoute({ position: { lat: 37.34, lng: 126.68 } })
      const url = new URL(fetchMock.mock.calls[0][0], 'http://x')
      expect(url.pathname).toBe('/api/directions')
      expect(url.searchParams.get('destination')).toBe('37.34,126.68')
      expect(route.path).toEqual(roadPath)
      expect(route).toMatchObject({ distanceKm: 42.3, durationMin: 51 })
      // 휴게소 좌표는 경로 범위 안
      route.restStops.forEach((s) => {
        expect(s.position.lat).toBeLessThanOrEqual(37.48)
        expect(s.position.lat).toBeGreaterThanOrEqual(37.35)
      })
    })

    it('길찾기 API 를 쓸 수 없으면(키 없음·네트워크 오류) 목업 경로로 대체한다', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }))
      const route = await getRoute({ position: { lat: 37.34, lng: 126.68 } })
      expect(route.path.length).toBeGreaterThan(1)
      expect(route.distanceKm).toBeGreaterThan(0)
    })
  })

  it('getRoute 는 경로와 경로 위 휴게소를 돌려준다', async () => {
    const [place] = await searchPlaces('오이도')
    const route = await getRoute(place)
    expect(route.path.length).toBeGreaterThan(1)
    expect(route.restStops.length).toBeGreaterThan(0)
    expect(route.distanceKm).toBeGreaterThan(0)
  })

  it('휴게소는 16개, 대표 메뉴는 최대 4개', async () => {
    const stops = await getRestStops()
    expect(stops).toHaveLength(16)
    expect(stops.every((s) => s.menus.length <= 4)).toBe(true)
  })

  it('generatePlaylist 는 약 1시간 분량의 곡과 선택 키워드를 돌려준다', async () => {
    const p = await generatePlaylist({ moods: ['신나는'], weather: '맑음', genres: ['발라드'] })
    expect(p.keywords).toEqual(['신나는', '맑음', '발라드'])
    const total = p.tracks.reduce((s, t) => s + t.duration, 0)
    expect(total).toBeGreaterThanOrEqual(55 * 60)
  })

  it('sendStory 는 DJ 대본을 만든다', async () => {
    const story = await sendStory('고마워요')
    expect(story.text).toBe('고마워요')
    expect(story.script).toContain('고마워요')
  })

  it('게임 문제는 10개씩', async () => {
    expect(await getBalanceQuestions()).toHaveLength(10)
    expect(await getQuizQuestions()).toHaveLength(10)
  })
})
