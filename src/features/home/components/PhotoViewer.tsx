import { useEffect, useState } from 'react'
import { Portal } from '@/components'
import { useOverlay } from '@/hooks/useOverlay'
import styles from './PhotoViewer.module.scss'

type PhotoViewerProps = {
  open: boolean
  photos: string[]
  initialIndex: number
  alt: string
  onClose: () => void
}

/** 사진 자세히 보기 — 풀스크린 뷰어 (디자인 없음 → 추가) */
export function PhotoViewer({ open, photos, initialIndex, alt, onClose }: PhotoViewerProps) {
  const [index, setIndex] = useState(initialIndex)
  useOverlay(open, onClose)

  useEffect(() => {
    if (open) setIndex(initialIndex)
  }, [open, initialIndex])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, photos.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, photos.length])

  if (!open) return null

  return (
    <Portal>
      <div role="dialog" aria-modal="true" aria-label={`${alt} 사진 자세히 보기`} className={styles.viewer}>
        <div className={styles.top}>
          <span className={styles.counter}>{`${index + 1} / ${photos.length}`}</span>
          <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.stage}>
          <img className={styles.photo} src={photos[index]} alt={`${alt} 사진 ${index + 1}`} />
        </div>

        <button
          type="button"
          className={styles.prev}
          aria-label="이전 사진"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          className={styles.next}
          aria-label="다음 사진"
          disabled={index === photos.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9 18l6-6-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <ul className={styles.dots} aria-hidden>
          {photos.map((src, i) => (
            <li key={`${src}-${i}`} className={i === index ? styles.dotActive : styles.dot} />
          ))}
        </ul>
      </div>
    </Portal>
  )
}
