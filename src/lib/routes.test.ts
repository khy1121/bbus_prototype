import { relativeRoutes } from './routes'

describe('relativeRoutes (지연 로딩 영역에 절대 경로 라우트를 상대 경로로 붙이기)', () => {
  const routes = [
    { path: '/places/:placeId', id: 'detail' },
    { path: '/places', id: 'list' },
    { path: '/notifications', id: 'noti' },
  ]

  it('base 아래 라우트만 남기고 상대 경로로 바꾼다 (base 와 같은 경로는 index)', () => {
    expect(relativeRoutes(routes, '/places')).toEqual([
      { path: ':placeId', id: 'detail' },
      { index: true, id: 'list' },
    ])
  })

  it('비슷한 접두어(/placesX)는 포함하지 않는다', () => {
    expect(relativeRoutes([{ path: '/placesX/a' }], '/places')).toEqual([])
  })
})
