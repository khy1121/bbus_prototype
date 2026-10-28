import clsx from 'clsx'
import { formatArrival, formatDistance, formatDriveTime } from '../utils/format'
import styles from './DriveStatsCard.module.scss'

type DriveStatsCardProps = {
  elapsedSec: number | null
  distanceKm: number | null
  arrival: Date | null
  className?: string
}

/** ① 주행 정보 카드 — 주행 시간 / 이동 거리 / 예상 도착 시간 (Figma 10:16206) */
export function DriveStatsCard({ elapsedSec, distanceKm, arrival, className }: DriveStatsCardProps) {
  const items = [
    { label: '주행 시간', value: formatDriveTime(elapsedSec) },
    { label: '이동 거리', value: formatDistance(distanceKm) },
    { label: '예상 도착 시간', value: formatArrival(arrival) },
  ]
  return (
    <dl className={clsx(styles.stats, className)}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
