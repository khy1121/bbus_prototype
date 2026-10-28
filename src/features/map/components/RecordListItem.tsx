import carIcon from '../assets/car-coral.svg'
import chevron from '../assets/chevron-right.svg'
import clockIcon from '../assets/clock.svg'
import pinIcon from '../assets/pin-coral.svg'
import type { DriveRecord } from '../types'
import { formatDistance, formatDuration, formatListDate } from '../utils/format'
import styles from './RecordListItem.module.scss'

type RecordListItemProps = {
  record: DriveRecord
  onClick: (id: string) => void
}

/** 목록형 기록 행 (Figma 10:15063) */
export function RecordListItem({ record, onClick }: RecordListItemProps) {
  const date = formatListDate(record.date)
  return (
    <button type="button" className={styles.item} onClick={() => onClick(record.id)}>
      <span className={styles.date}>
        <span className={styles.year}>{date.year}</span>
        <span className={styles.monthDay}>{date.monthDay}</span>
        <span className={styles.weekday}>{date.weekday}</span>
      </span>
      <img className={styles.thumb} src={record.thumbnail} alt="" loading="lazy" />
      <span className={styles.info}>
        <span className={styles.title}>{record.title}</span>
        <span className={styles.meta}>
          <img src={pinIcon} alt="" aria-hidden />
          <span>{record.place}</span>
        </span>
        <span className={styles.metaRow}>
          <span className={styles.meta}>
            <img src={carIcon} alt="" aria-hidden className={styles.car} />
            <span>{formatDistance(record.distanceKm)}</span>
          </span>
          <span className={styles.meta}>
            <img src={clockIcon} alt="" aria-hidden />
            <span>{formatDuration(record.durationMin)}</span>
          </span>
        </span>
      </span>
      <img className={styles.chevron} src={chevron} alt="" aria-hidden />
    </button>
  )
}
