import clsx from 'clsx'
import styles from './RecordDetail.module.scss'

const VISIBLE = 3

/** 사진 콜라주 — 큰 사진 1 + 작은 사진 2, 남은 장수는 +N (Figma 10:15537) */
export function PhotoCollage({ photos, title }: { photos: string[]; title: string }) {
  const visible = photos.slice(0, VISIBLE)
  const rest = photos.length - visible.length
  return (
    <div className={clsx(styles.collage, styles[`count${visible.length}`])}>
      {visible.map((src, i) => (
        <div key={src + i} className={clsx(styles.photoCell, i === 0 && styles.photoMain)}>
          <img src={src} alt={`${title} 사진 ${i + 1}`} loading="lazy" />
          {rest > 0 && i === visible.length - 1 && <span className={styles.more}>{`+${rest}`}</span>}
        </div>
      ))}
    </div>
  )
}
