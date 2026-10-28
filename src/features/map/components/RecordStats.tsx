import type { DriveRecord } from '../types'
import { formatDistance, formatDuration } from '../utils/format'
import styles from './RecordDetail.module.scss'

/** 이동 거리 / 주행 시간 / 휴게소 도장 (Figma 10:15507) */
export function RecordStats({ record }: { record: DriveRecord }) {
  const stats = [
    { label: '이동 거리', value: formatDistance(record.distanceKm) },
    { label: '주행 시간', value: formatDuration(record.durationMin) },
    { label: '휴게소 도장', value: `${record.stampCount}개` },
  ]
  return (
    <dl className={styles.stats}>
      {stats.map((s) => (
        <div key={s.label} className={styles.stat}>
          <dt className={styles.statLabel}>{s.label}</dt>
          <dd className={styles.statValue}>{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}
