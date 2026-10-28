// 드라이브 모드 전용 에셋 (Figma DriveMode_Components 에서 export)
import type { Direction } from '@/lib/heading'
import route from './assets/icons/route.svg'
import locate from './assets/icons/locate.svg'
import exit from './assets/icons/exit.svg'
import djLoadingDisc from './assets/dj/loading-disc.svg'
import djStepDone from './assets/dj/step-done.svg'
import djStepPending from './assets/dj/step-pending.svg'
import stop from './assets/icons/stop.svg'
import menu from './assets/icons/menu.svg'
import hamburger from './assets/icons/hamburger.svg'
import carLine from './assets/icons/car-line.svg'
import closeSmall from './assets/icons/close-small.svg'
import closeLarge from './assets/icons/close-large.svg'
import xSmall from './assets/icons/x-small.svg'
import musicNote from './assets/icons/music-note.svg'
import chevronCircle from './assets/icons/chevron-circle.svg'
import chevronRight from './assets/icons/chevron-right.svg'
import pause from './assets/icons/pause.svg'
import play from './assets/icons/play.svg'
import playerControls from './assets/icons/player-controls.svg'
import bookmark from './assets/icons/bookmark.svg'
import bookmarkFilled from './assets/icons/bookmark-filled.svg'
import dragDotsA from './assets/icons/drag-dots-a.svg'
import dragDotsB from './assets/icons/drag-dots-b.svg'
import recentPin from './assets/icons/recent-pin.svg'
import routeDots from './assets/icons/route-dots.svg'
import swap from './assets/icons/swap.svg'
import roadMap from './assets/icons/road-map.svg'
import pinCoral from './assets/icons/pin-coral.svg'
import markerStart from './assets/icons/marker-start.svg'
import markerEnd from './assets/icons/marker-end.svg'
import story from './assets/icons/story.svg'
import sendArrow from './assets/icons/send-arrow.svg'
import searchDark from './assets/icons/search-dark.svg'
import arrowTurn from './assets/arrow-turn.webp'
import avatarDriver from './assets/avatar-driver.webp'
import avatarPassenger from './assets/avatar-passenger.webp'
import carE from './assets/car/car-e.webp'
import carN from './assets/car/car-n.webp'
import carNE from './assets/car/car-ne.webp'
import carNW from './assets/car/car-nw.webp'
import carS from './assets/car/car-s.webp'
import carSE from './assets/car/car-se.webp'
import carSW from './assets/car/car-sw.webp'
import carW from './assets/car/car-w.webp'
import chalkboard from './assets/chalkboard.webp'
import check from './assets/check.webp'
import djHero from './assets/dj-hero.webp'
import gameBalance from './assets/game-balance.webp'
import gameMemory from './assets/game-memory.webp'
import gameQuiz from './assets/game-quiz.webp'
import gameRadio from './assets/game-radio.webp'
import heartMarker from './assets/heart-marker.webp'
import num1 from './assets/num-1.webp'
import num2 from './assets/num-2.webp'
import num3 from './assets/num-3.webp'
import postit from './assets/postit.webp'
import radioHero from './assets/radio-hero.webp'
import restStop from './assets/rest-stop.webp'
import sparkle from './assets/sparkle.webp'
import stamp from './assets/stamp.webp'
import stampBoard from './assets/stamp-board.webp'
import stampLocked from './assets/stamp-locked.webp'
import stampPink from './assets/stamp-pink.webp'
import radioWave from './assets/radio-wave.svg'

export const icons = {
  radioWave,
  route,
  locate,
  exit,
  stop,
  menu,
  hamburger,
  carLine,
  closeSmall,
  closeLarge,
  xSmall,
  musicNote,
  chevronCircle,
  chevronRight,
  pause,
  play,
  playerControls,
  bookmark,
  bookmarkFilled,
  dragDotsA,
  dragDotsB,
  recentPin,
  routeDots,
  swap,
  roadMap,
  pinCoral,
  markerStart,
  markerEnd,
  story,
  sendArrow,
  searchDark,
}

export const images = {
  djLoadingDisc,
  djStepDone,
  djStepPending,
  arrowTurn,
  avatarDriver,
  avatarPassenger,
  chalkboard,
  check,
  djHero,
  gameBalance,
  gameMemory,
  gameQuiz,
  gameRadio,
  heartMarker,
  num1,
  num2,
  num3,
  postit,
  radioHero,
  restStop,
  sparkle,
  stamp,
  stampBoard,
  stampLocked,
  stampPink,
}

/**
 * 진행 방향별 차량 마커 (8방향, 위에서 비스듬히 본 시점). AI(GPT 이미지)로 생성 — Figma '붕붕어스 차량 방향 에셋 (AI 생성)'.
 * 모든 방향이 같은 캔버스에 바퀴 기준 바닥 정렬되어 있어 방향이 바뀌어도 마커 위치가 흔들리지 않는다.
 */
export const carByDirection: Record<Direction, string> = {
  N: carN,
  NE: carNE,
  E: carE,
  SE: carSE,
  S: carS,
  SW: carSW,
  W: carW,
  NW: carNW,
}

/** 차량 마커 표시 크기 (원본 180×156 의 1/3) */
export const CAR_MARKER_SIZE = { width: 60, height: 52 } as const
