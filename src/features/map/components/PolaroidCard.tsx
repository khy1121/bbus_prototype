import clsx from 'clsx'
import type { DriveRecord } from '../types'
import { formatKoreanDate } from '../utils/format'
import styles from './PolaroidCard.module.scss'

type PolaroidCardProps = {
  record: Pick<DriveRecord, 'title' | 'date' | 'thumbnail'>
  onClick?: () => void
  /** sm: 공유 시트 썸네일용 축소판 */
  size?: 'md' | 'sm'
  className?: string
}

/** 폴라로이드 기록 카드 269×337 (Figma 10:15283) */
export function PolaroidCard({ record, onClick, size = 'md', className }: PolaroidCardProps) {
  const content = (
    <>
      <img className={styles.photo} src={record.thumbnail} alt={record.title} />
      <span className={styles.texts}>
        <span className={styles.title}>{record.title}</span>
        <span className={styles.date}>{formatKoreanDate(record.date)}</span>
      </span>
    </>
  )
  const cls = clsx(styles.card, styles[size], className)
  return onClick ? (
    <button type="button" className={cls} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={cls}>{content}</div>
  )
}
