import { screen, waitFor } from '@testing-library/react'
import { useDriveDataStore } from '../../stores/driveDataStore'
import { useRadioStore } from '../../stores/radioStore'
import { renderDrive } from '../../test-utils'

describe('라디오 (11 / 12)', () => {
  beforeEach(() => {
    useDriveDataStore.getState().reset()
    useRadioStore.getState().stop()
  })

  it('사연이 비어 있으면 사연 보내기 비활성화, 글자수 표시', async () => {
    const { user } = renderDrive('/drive/radio')
    expect(screen.getByRole('heading', { name: '사연 입력하기' })).toBeInTheDocument()
    const send = screen.getByRole('button', { name: '사연 보내기' })
    expect(send).toBeDisabled()
    await user.type(screen.getByRole('textbox', { name: '사연' }), '고마워')
    expect(screen.getByText('3/300')).toBeInTheDocument()
    expect(send).toBeEnabled()
  })

  it('사연 보내기 → 드라이브 화면으로 돌아가고, 라디오는 계속 재생 (Figma 10:9309)', async () => {
    const { user, router } = renderDrive('/drive/radio')
    await user.type(screen.getByRole('textbox', { name: '사연' }), '고마워요')
    await user.click(screen.getByRole('button', { name: '사연 보내기' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/drive'))
    expect(useDriveDataStore.getState().stories[0].text).toBe('고마워요')
    expect(useRadioStore.getState()).toMatchObject({ isPlaying: true, story: { text: '고마워요' } })
    expect(await screen.findByText('재생 중')).toBeInTheDocument()
  })

  it('재생 중인 라디오 카드를 누르면 재생 화면에 DJ 대본이 보인다', async () => {
    const { user } = renderDrive('/drive/radio')
    await user.type(screen.getByRole('textbox', { name: '사연' }), '고마워요')
    await user.click(screen.getByRole('button', { name: '사연 보내기' }))
    await user.click(await screen.findByRole('link', { name: /라디오/ }))
    expect(await screen.findByRole('heading', { name: '사연 재생 중' })).toBeInTheDocument()
    expect(screen.getByText(/고마워요/)).toBeInTheDocument()
  })

  it('랜덤 사연 START! → 재생 화면', async () => {
    const { user } = renderDrive('/drive/radio')
    await user.click(screen.getByRole('button', { name: '랜덤 사연 START!' }))
    expect(await screen.findByRole('heading', { name: '사연 재생 중' })).toBeInTheDocument()
  })

  it('메뉴 → 보낸 사연 목록 서랍, 검색, 항목 탭 → 재생', async () => {
    const { user } = renderDrive('/drive/radio')
    await user.click(screen.getByRole('button', { name: '보낸 사연 목록' }))
    const drawer = screen.getByRole('dialog', { name: '보낸 사연 목록' })
    expect(drawer).toBeInTheDocument()
    await user.type(screen.getByRole('searchbox', { name: '사연 검색' }), '배가')
    expect(screen.getAllByRole('button', { name: /배가 너무 고파서/ })).toHaveLength(1)
    expect(screen.queryByRole('button', { name: /오늘 날씨가/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /배가 너무 고파서/ }))
    expect(await screen.findByRole('heading', { name: '사연 재생 중' })).toBeInTheDocument()
  })

  it('재생 화면의 새로운 사연 보내기 → 입력 화면', async () => {
    const { user, router } = renderDrive('/drive/radio')
    await user.click(screen.getByRole('button', { name: '랜덤 사연 START!' }))
    await user.click(await screen.findByRole('button', { name: '새로운 사연 보내기' }))
    expect(router.state.location.pathname).toBe('/drive/radio')
  })

  it('재생 화면에서 뒤로가기 해도 라디오는 계속 재생된다', async () => {
    const { user, router } = renderDrive('/drive/radio')
    await user.click(screen.getByRole('button', { name: '랜덤 사연 START!' }))
    await screen.findByRole('heading', { name: '사연 재생 중' })
    await user.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(router.state.location.pathname).toBe('/drive')
    expect(useRadioStore.getState().isPlaying).toBe(true)
  })

  it('재생 화면의 중단하기 → 재생을 멈추고 드라이브 화면', async () => {
    const { user, router } = renderDrive('/drive/radio')
    await user.click(screen.getByRole('button', { name: '랜덤 사연 START!' }))
    await user.click(await screen.findByRole('button', { name: '중단하기' }))
    expect(router.state.location.pathname).toBe('/drive')
    expect(useRadioStore.getState().isPlaying).toBe(false)
  })
})
