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
