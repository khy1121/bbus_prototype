import { vi } from 'vitest'
import { radioEngine, useRadioStore } from './radioStore'

const story = { id: 's1', text: '고마워요', script: '안녕하세요, DJ 붕붕입니다. 고마워요', createdAt: '2026-10-28' }

describe('radioStore (화면을 나가도 계속 재생되는 전역 라디오)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useRadioStore.getState().stop()
  })

  it('play 하면 현재 사연과 재생 상태를 저장하고 TTS 엔진으로 대본을 읽는다', () => {
    const speak = vi.spyOn(radioEngine, 'speak').mockImplementation(() => {})
    useRadioStore.getState().play(story)
    expect(useRadioStore.getState()).toMatchObject({ story, isPlaying: true })
    expect(speak).toHaveBeenCalledWith(story.script, expect.any(Function))
  })

  it('엔진이 끝까지 읽으면 재생 상태가 꺼진다 (사연은 유지)', () => {
    let onEnd = () => {}
    vi.spyOn(radioEngine, 'speak').mockImplementation((_, end) => {
      onEnd = end
    })
    useRadioStore.getState().play(story)
    onEnd()
    expect(useRadioStore.getState()).toMatchObject({ story, isPlaying: false })
  })

  it('stop 하면 엔진을 멈추고 상태를 초기화한다', () => {
    vi.spyOn(radioEngine, 'speak').mockImplementation(() => {})
    const cancel = vi.spyOn(radioEngine, 'cancel')
    useRadioStore.getState().play(story)
    useRadioStore.getState().stop()
    expect(cancel).toHaveBeenCalled()
    expect(useRadioStore.getState()).toMatchObject({ story: null, isPlaying: false })
  })

  it('다른 사연을 재생하면 이전 재생을 끊고 새로 읽는다', () => {
    const speak = vi.spyOn(radioEngine, 'speak').mockImplementation(() => {})
    const cancel = vi.spyOn(radioEngine, 'cancel')
    useRadioStore.getState().play(story)
    useRadioStore.getState().play({ ...story, id: 's2', script: '두 번째' })
    expect(cancel).toHaveBeenCalled()
    expect(speak).toHaveBeenLastCalledWith('두 번째', expect.any(Function))
    expect(useRadioStore.getState().story?.id).toBe('s2')
  })
})
