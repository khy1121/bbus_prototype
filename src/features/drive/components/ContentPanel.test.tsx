import { screen } from '@testing-library/react'
import { renderWithRouter } from '@/test/utils'
import { MOCK_TRACKS } from '../mocks'
import { usePlayerStore } from '../stores/playerStore'
import { useRadioStore } from '../stores/radioStore'
import { ContentPanel } from './ContentPanel'

describe('ContentPanel (함께 즐길 콘텐츠)', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset()
    useRadioStore.getState().stop()
  })

  it('제목과 DJ 카드, 콘텐츠 4종 링크를 보여준다', () => {
    renderWithRouter(<ContentPanel />)
    expect(screen.getByRole('heading', { name: '함께 즐길 콘텐츠' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /플레이리스트를 만들러 가볼까요/ })).toHaveAttribute('href', '/drive/dj')
    expect(screen.getByRole('link', { name: /라디오/ })).toHaveAttribute('href', '/drive/radio')
    expect(screen.getByRole('link', { name: /밸런스 게임/ })).toHaveAttribute('href', '/drive/games/balance')
    expect(screen.getByRole('link', { name: /넌센스 퀴즈/ })).toHaveAttribute('href', '/drive/games/quiz')
    expect(screen.getByRole('link', { name: /추억 게임/ })).toHaveAttribute('href', '/drive/games/memory')
  })

  it('재생 중이면 DJ 카드가 재생 카드로 바뀌고 제어 버튼이 동작한다', async () => {
    const s = usePlayerStore.getState()
    s.setPlaylist({ id: 'p', title: '노을처럼 따뜻한 우리', keywords: [], tracks: MOCK_TRACKS.slice(0, 3) })
    s.playAll()
    const { user } = renderWithRouter(<ContentPanel />)
    expect(screen.getByText(MOCK_TRACKS[0].title)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다음 곡' }))
    expect(usePlayerStore.getState().currentIndex).toBe(1)
    await user.click(screen.getByRole('button', { name: '일시정지' }))
    expect(usePlayerStore.getState().isPlaying).toBe(false)
    expect(screen.getByRole('button', { name: '재생' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '이전 곡' }))
    expect(usePlayerStore.getState().currentIndex).toBe(0)
  })

  it('라디오가 재생 중이면 라디오 카드에 "재생 중" 표시, 카드는 재생 화면으로 연결된다', () => {
    useRadioStore.setState({ story: { id: 's1', text: 't', script: 's', createdAt: '' }, isPlaying: true })
    renderWithRouter(<ContentPanel />)
    const radio = screen.getByRole('link', { name: /라디오/ })
    expect(radio).toHaveTextContent('재생 중')
    expect(radio).not.toHaveTextContent('드라이브에 감성을 담는')
    expect(radio).toHaveAttribute('href', '/drive/radio/playing')
  })
})
