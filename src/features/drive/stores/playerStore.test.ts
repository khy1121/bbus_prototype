import type { Playlist } from '../types'
import { usePlayerStore } from './playerStore'

const playlist: Playlist = {
  id: 'p1',
  title: '노을처럼 따뜻한 우리',
  keywords: ['신나는', '맑음'],
  tracks: [
    { id: 't1', title: 'A', artist: 'x', duration: 200, albumArt: '' },
    { id: 't2', title: 'B', artist: 'y', duration: 200, albumArt: '' },
    { id: 't3', title: 'C', artist: 'z', duration: 200, albumArt: '' },
  ],
}

describe('playerStore', () => {
  beforeEach(() => usePlayerStore.getState().reset())

  it('플레이리스트를 설정하고 전체 재생하면 첫 곡부터 재생된다', () => {
    const s = usePlayerStore.getState()
    s.setPlaylist(playlist)
    s.playAll()
    const st = usePlayerStore.getState()
    expect(st.isPlaying).toBe(true)
    expect(st.currentIndex).toBe(0)
    expect(st.mode).toBe('all')
  })

  it('곡 탭 시 그 곡만 단일 재생한다', () => {
    usePlayerStore.getState().setPlaylist(playlist)
    usePlayerStore.getState().playSingle(2)
    const st = usePlayerStore.getState()
    expect(st.currentIndex).toBe(2)
    expect(st.mode).toBe('single')
  })

  it('다음/이전 곡은 범위를 순환한다', () => {
    const s = usePlayerStore.getState()
    s.setPlaylist(playlist)
    s.playAll()
    s.prev()
    expect(usePlayerStore.getState().currentIndex).toBe(2)
    usePlayerStore.getState().next()
    expect(usePlayerStore.getState().currentIndex).toBe(0)
  })

  it('재생/일시정지 토글', () => {
    usePlayerStore.getState().setPlaylist(playlist)
    usePlayerStore.getState().playAll()
    usePlayerStore.getState().togglePlay()
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('곡 삭제/순서 변경', () => {
    const s = usePlayerStore.getState()
    s.setPlaylist(playlist)
    s.moveTrack(0, 2)
    expect(usePlayerStore.getState().playlist!.tracks.map((t) => t.id)).toEqual(['t2', 't3', 't1'])
    usePlayerStore.getState().removeTrack('t3')
    expect(usePlayerStore.getState().playlist!.tracks.map((t) => t.id)).toEqual(['t2', 't1'])
  })

  it('저장 토글', () => {
    usePlayerStore.getState().setPlaylist(playlist)
    usePlayerStore.getState().toggleSaved()
    expect(usePlayerStore.getState().saved).toBe(true)
  })
})
