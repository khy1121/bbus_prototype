import clsx from 'clsx'
import { icons } from '../assets'
import styles from './PlayerControls.module.scss'

type PlayerControlsProps = {
  isPlaying: boolean
  onPrev: () => void
  onToggle: () => void
  onNext: () => void
  className?: string
}

/**
 * 이전/재생·일시정지/다음 (Figma 10:14250)
 * 이전·다음 아이콘은 Figma 합성 SVG(player-controls.svg) 의 해당 영역을 잘라서 쓴다.
 */
export function PlayerControls({ isPlaying, onPrev, onToggle, onNext, className }: PlayerControlsProps) {
  return (
    <div className={clsx(styles.controls, className)}>
      <button type="button" className={clsx(styles.side, styles.prev)} aria-label="이전 곡" onClick={onPrev}>
        <img src={icons.playerControls} alt="" aria-hidden />
      </button>
      <button type="button" className={styles.toggle} aria-label={isPlaying ? '일시정지' : '재생'} onClick={onToggle}>
        <img src={isPlaying ? icons.pause : icons.play} alt="" aria-hidden />
      </button>
      <button type="button" className={clsx(styles.side, styles.next)} aria-label="다음 곡" onClick={onNext}>
        <img src={icons.playerControls} alt="" aria-hidden />
      </button>
    </div>
  )
}
