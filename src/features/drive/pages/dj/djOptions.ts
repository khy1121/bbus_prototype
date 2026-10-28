// DJ 취향 선택 옵션 (Figma 10:9512)
export type DjOption = { emoji: string; label: string }

export const MOODS: DjOption[] = [
  { emoji: '😆', label: '신나는' },
  { emoji: '🌙', label: '감성적인' },
  { emoji: '🌿', label: '차분한' },
  { emoji: '✈️', label: '여행' },
  { emoji: '💖', label: '설레는' },
  { emoji: '🌅', label: '노을 감성' },
  { emoji: '🌃', label: '도시 야경' },
  { emoji: '☁️', label: '낭만' },
  { emoji: '🔥', label: '졸음 깨우는' },
]

export const WEATHERS: DjOption[] = [
  { emoji: '🌞', label: '맑음' },
  { emoji: '🌫️', label: '흐림' },
  { emoji: '🌧️', label: '비' },
  { emoji: '❄️', label: '눈' },
  { emoji: '💨', label: '바람' },
]

export const GENRES: DjOption[] = [
  { emoji: '🎧', label: '발라드' },
  { emoji: '🎤', label: 'K-POP' },
  { emoji: '🎸', label: '인디' },
  { emoji: '🎷', label: '팝' },
  { emoji: '💿', label: '시티팝' },
  { emoji: '🎹', label: '재즈' },
  { emoji: '🎵', label: 'R&B' },
  { emoji: '👩🏻‍🎤', label: '힙합' },
  { emoji: '🪇', label: '어쿠스틱' },
  { emoji: '💃🏻', label: '댄스' },
  { emoji: '🎬', label: 'OST' },
  { emoji: '🥁', label: '밴드' },
]

export const MAX_MOODS = 2
export const MAX_GENRES = 3

const ALL = [...MOODS, ...WEATHERS, ...GENRES]
export const emojiOf = (label: string) => ALL.find((o) => o.label === label)?.emoji ?? ''
