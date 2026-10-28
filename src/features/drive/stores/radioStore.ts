import { create } from 'zustand'
import type { RadioStory } from '../types'

/**
 * 라디오 음성 엔진.
 * TODO(backend): 서버 TTS 오디오(URL)로 교체. 지금은 브라우저 Web Speech API 로 대본을 읽는다.
 * 모듈 전역에서 재생하므로 라우트(화면)를 옮겨도 끊기지 않는다.
 */
export const radioEngine = {
  speak(text: string, onEnd: () => void) {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR'
    utterance.rate = 1
    utterance.onend = onEnd
    synth.speak(utterance)
  },
  cancel() {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  },
}

type RadioState = {
  /** 현재(또는 마지막으로) 재생한 사연 */
  story: RadioStory | null
  isPlaying: boolean
  play: (story: RadioStory) => void
  stop: () => void
}

export const useRadioStore = create<RadioState>((set, get) => ({
  story: null,
  isPlaying: false,

  play: (story) => {
    radioEngine.cancel()
    set({ story, isPlaying: true })
    radioEngine.speak(story.script, () => {
      // 다른 사연으로 바뀐 뒤 늦게 도착한 종료 이벤트는 무시
      if (get().story?.id === story.id) set({ isPlaying: false })
    })
  },

  stop: () => {
    radioEngine.cancel()
    set({ story: null, isPlaying: false })
  },
}))
