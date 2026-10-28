import { MAX_RECENT_SEARCHES, useDriveDataStore } from './driveDataStore'

describe('driveDataStore', () => {
  beforeEach(() => useDriveDataStore.getState().reset())

  it('최근 검색어를 맨 앞에 추가하고 중복은 제거한다', () => {
    const s = useDriveDataStore.getState()
    s.addRecentSearch('강릉', new Date(2026, 9, 26))
    s.addRecentSearch('강릉', new Date(2026, 9, 27))
    const list = useDriveDataStore.getState().recentSearches
    expect(list[0]).toMatchObject({ keyword: '강릉', date: '10.27' })
    expect(list.filter((r) => r.keyword === '강릉')).toHaveLength(1)
  })

  it(`최근 검색어는 최대 ${MAX_RECENT_SEARCHES}개`, () => {
    for (let i = 0; i < 40; i++) useDriveDataStore.getState().addRecentSearch(`검색${i}`)
    expect(useDriveDataStore.getState().recentSearches).toHaveLength(MAX_RECENT_SEARCHES)
  })

  it('최근 검색어 삭제', () => {
    const first = useDriveDataStore.getState().recentSearches[0]
    useDriveDataStore.getState().removeRecentSearch(first.id)
    expect(useDriveDataStore.getState().recentSearches.find((r) => r.id === first.id)).toBeUndefined()
  })

  it('스탬프 획득', () => {
    useDriveDataStore.getState().acquireStamp('rs-5')
    expect(useDriveDataStore.getState().stamps['rs-5']).toBeTruthy()
  })

  it('보낸 사연을 최신순으로 저장한다', () => {
    useDriveDataStore.getState().addStory({ id: 'n', text: '새 사연', script: 's', createdAt: '2026-10-28' })
    expect(useDriveDataStore.getState().stories[0].id).toBe('n')
  })
})
