import { act, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import * as api from '../../api'
import { usePlayerStore } from '../../stores/playerStore'
import { DJ_GENERATE_TIMEOUT_MS } from './DjLoadingPage'

// 실제 구현을 쓰되, 실패/지연 케이스만 테스트에서 덮어쓴다
vi.mock('../../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api')>()
  return { ...actual, generatePlaylist: vi.fn(actual.generatePlaylist) }
})
import { renderDrive } from '../../test-utils'

describe('DJ 플레이리스트 (07 → 08 → 09)', () => {
  beforeEach(() => usePlayerStore.getState().reset())
  afterEach(() => vi.useRealTimers())

  it('분위기·날씨를 고르기 전에는 만들기 버튼이 비활성화', async () => {
    const { user } = renderDrive('/drive/dj')
    const cta = screen.getByRole('button', { name: /AI 플레이리스트 만들기/ })
    expect(cta).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /신나는/ }))
    expect(cta).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /맑음/ }))
    expect(cta).toBeEnabled()
  })

  it('분위기는 최대 2개, 장르는 최대 3개까지 선택된다', async () => {
    const { user } = renderDrive('/drive/dj')
    for (const m of ['신나는', '감성적인', '차분한']) await user.click(screen.getByRole('button', { name: new RegExp(m) }))
    expect(screen.getByRole('button', { name: /차분한/ })).toHaveAttribute('aria-pressed', 'false')
    for (const g of ['발라드', 'K-POP', '인디', '재즈'])
      await user.click(screen.getByRole('button', { name: new RegExp(g) }))
    expect(screen.getByRole('button', { name: /재즈/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('날씨는 하나만 선택된다', async () => {
    const { user } = renderDrive('/drive/dj')
    await user.click(screen.getByRole('button', { name: /맑음/ }))
    await user.click(screen.getByRole('button', { name: /흐림/ }))
    expect(screen.getByRole('button', { name: /맑음/ })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /흐림/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('만들기 → 생성 중(3단계) → 자동으로 결과 화면', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { user, router } = renderDrive('/drive/dj')
    await user.click(screen.getByRole('button', { name: /신나는/ }))
    await user.click(screen.getByRole('button', { name: /맑음/ }))
    await user.click(screen.getByRole('button', { name: /AI 플레이리스트 만들기/ }))
    expect(router.state.location.pathname).toBe('/drive/dj/loading')
    expect(screen.getByText('선택한 키워드 분석')).toBeInTheDocument()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(router.state.location.pathname).toBe('/drive/dj/result')
    expect(await screen.findByRole('heading', { name: '노을처럼 따뜻한 우리' })).toBeInTheDocument()
  })

  it('생성 중 취소 → 취향 선택으로', async () => {
    const { user, router } = renderDrive('/drive/dj')
    await user.click(screen.getByRole('button', { name: /신나는/ }))
    await user.click(screen.getByRole('button', { name: /맑음/ }))
    await user.click(screen.getByRole('button', { name: /AI 플레이리스트 만들기/ }))
    await user.click(screen.getByRole('button', { name: '생성 취소' }))
    expect(router.state.location.pathname).toBe('/drive/dj')
  })

  async function startGenerating() {
    const view = renderDrive('/drive/dj')
    await view.user.click(screen.getByRole('button', { name: /신나는/ }))
    await view.user.click(screen.getByRole('button', { name: /맑음/ }))
    await view.user.click(screen.getByRole('button', { name: /AI 플레이리스트 만들기/ }))
    return view
  }

  it('생성에 실패하면 안내 팝업을 띄우고, 닫기 → 취향 선택으로', async () => {
    vi.mocked(api.generatePlaylist).mockRejectedValueOnce(new Error('LLM error'))
    const { user, router } = await startGenerating()
    const dialog = await screen.findByRole('dialog', { name: '플레이리스트를 만들지 못했어요' })
    await user.click(within(dialog).getByRole('button', { name: '닫기' }))
    expect(router.state.location.pathname).toBe('/drive/dj')
    expect(usePlayerStore.getState().playlist).toBeNull()
  })

  it(`${DJ_GENERATE_TIMEOUT_MS / 1000}초 안에 생성되지 않으면 시간 초과 팝업을 띄운다`, async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.mocked(api.generatePlaylist).mockReturnValueOnce(new Promise(() => {}))
    const { router } = await startGenerating()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DJ_GENERATE_TIMEOUT_MS + 100)
    })
    expect(screen.getByRole('dialog', { name: '생성 시간이 초과되었어요' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/drive/dj/loading')
  })

  describe('결과 화면', () => {
    async function openResult() {
      const { generatePlaylist } = await import('../../api')
      const p = await generatePlaylist({ moods: ['신나는'], weather: '맑음', genres: ['발라드'] })
      usePlayerStore.getState().setPlaylist(p)
      return renderDrive('/drive/dj/result')
    }

    it('곡 수, 키워드, 곡 목록을 보여준다', async () => {
      await openResult()
      const count = usePlayerStore.getState().playlist!.tracks.length
      expect(screen.getByText(new RegExp(`총 ${count}곡`))).toBeInTheDocument()
      expect(screen.getAllByText(/신나는|맑음|발라드/).length).toBeGreaterThanOrEqual(3)
      expect(within(screen.getByRole('list', { name: '곡 목록' })).getAllByRole('listitem')).toHaveLength(count)
    })

    it('삭제 버튼으로 곡을 지운다', async () => {
      const { user } = await openResult()
      const before = usePlayerStore.getState().playlist!.tracks.length
      const first = usePlayerStore.getState().playlist!.tracks[0]
      await user.click(screen.getAllByRole('button', { name: `${first.title} 삭제` })[0])
      expect(usePlayerStore.getState().playlist!.tracks).toHaveLength(before - 1)
    })

    it('순서 이동(키보드 대체: 아래로)', async () => {
      const { user } = await openResult()
      const [t0, t1] = usePlayerStore.getState().playlist!.tracks
      screen.getByRole('button', { name: `${t0.title} 순서 변경` }).focus()
      await user.keyboard('{ArrowDown}')
      const ids = usePlayerStore.getState().playlist!.tracks.map((t) => t.id)
      expect(ids.slice(0, 2)).toEqual([t1.id, t0.id])
    })

    it('저장 토글', async () => {
      const { user } = await openResult()
      await user.click(screen.getByRole('button', { name: '플레이리스트 저장' }))
      expect(usePlayerStore.getState().saved).toBe(true)
    })

    it('전체 재생 → 드라이브 화면, 재생 상태', async () => {
      const { user, router } = await openResult()
      await user.click(screen.getByRole('button', { name: '전체 재생' }))
      expect(router.state.location.pathname).toBe('/drive')
      expect(usePlayerStore.getState().isPlaying).toBe(true)
    })

    it('다시 만들기 → 취향 선택', async () => {
      const { user, router } = await openResult()
      await user.click(screen.getByRole('button', { name: '다시 만들기' }))
      expect(router.state.location.pathname).toBe('/drive/dj')
    })

    it('곡 탭 → 단일 재생', async () => {
      const { user } = await openResult()
      const t = usePlayerStore.getState().playlist!.tracks[2]
      await user.click(screen.getByRole('button', { name: new RegExp(`${t.title} 재생`) }))
      expect(usePlayerStore.getState()).toMatchObject({ currentIndex: 2, mode: 'single', isPlaying: true })
    })
  })
})
