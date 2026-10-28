import { useRef, useState, type KeyboardEvent } from 'react'
import clsx from 'clsx'
import styles from './PhotoSlider.module.scss'

type PhotoSliderProps = {
  photos: string[]
  alt: string
  onOpen: (index: number) => void
  className?: string
}

/** 상세 상단 사진 슬라이드 + "n / N" 카운터 (Figma 10:6454, 10:6457) */
export function PhotoSlider({ photos, alt, onOpen, className }: PhotoSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), photos.length - 1)
    setIndex(clamped)
    const el = trackRef.current
    el?.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
  }

  const handleScroll = () => {
    const el = trackRef.current
    if (!el || el.clientWidth === 0) return
    setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') goTo(index + 1)
    else if (e.key === 'ArrowLeft') goTo(index - 1)
  }

  return (
    <div className={clsx(styles.slider, className)}>
      <div
        ref={trackRef}
        className={styles.track}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${alt} 사진`}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        {photos.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className={styles.slide}
            aria-label={`${alt} 사진 ${i + 1} 크게 보기`}
            onClick={() => onOpen(i)}
          >
            <img src={src} alt={`${alt} 사진 ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
          </button>
        ))}
      </div>
      <span className={styles.counter} aria-live="polite">
        {`${index + 1} / ${photos.length}`}
      </span>
    </div>
  )
}
