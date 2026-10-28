import { fetchDriveConditions, fetchNotifications, fetchPlaceDetail, fetchPlacesByCategory } from './api'

describe('home api (mock)', () => {
  it('카테고리별 장소 7개를 돌려준다', async () => {
    for (const cat of ['sea', 'night', 'cafe', 'nature', 'camp'] as const) {
      const list = await fetchPlacesByCategory(cat)
      expect(list).toHaveLength(7)
    }
  })

  it('새로고침(page) 시 순서가 바뀐 목록을 돌려준다', async () => {
    const a = await fetchPlacesByCategory('sea', 0)
    const b = await fetchPlacesByCategory('sea', 1)
    expect(b.map((p) => p.id)).not.toEqual(a.map((p) => p.id))
  })

  it('장소 상세를 id 로 조회하고 없으면 null', async () => {
    const oido = await fetchPlaceDetail('oido')
    expect(oido?.name).toBe('시흥 오이도')
    expect(oido?.photos.length).toBeGreaterThan(1)
    expect(await fetchPlaceDetail('nope')).toBeNull()
  })

  it('드라이브 정보와 알림 목록을 돌려준다', async () => {
    const c = await fetchDriveConditions()
    expect(c.theme).toBeTruthy()
    const n = await fetchNotifications()
    expect(n.length).toBeGreaterThan(0)
  })
})
