import { SUMMARY_ICONS, summarySprite } from '../sprites'
import type { PlaceDriveSummary } from '../types'
import { SpriteImage } from './SpriteImage'
import styles from './DriveSummary.module.scss'

type DriveSummaryProps = {
  summary: PlaceDriveSummary
  /** 위치 권한이 없으면 예상 시간을 '- -' 로 */
  locationGranted: boolean
}

/** 드라이브 정보 요약 4종 (Figma 10:6492) */
export function DriveSummary({ summary, locationGranted }: DriveSummaryProps) {
  const items = [
    { key: 'duration', icon: SUMMARY_ICONS.duration, label: '예상 소요 시간', value: locationGranted ? summary.duration : '- -' },
    { key: 'route', icon: SUMMARY_ICONS.route, label: '주요 경로', value: summary.mainRoute },
    { key: 'parking', icon: SUMMARY_ICONS.parking, label: '주차 정보', value: summary.parking },
    { key: 'visit', icon: SUMMARY_ICONS.visitTime, label: '추천 방문 시간', value: summary.visitTime, note: summary.visitTimeNote },
  ]

  return (
    <ul className={styles.summary} aria-label="드라이브 정보 요약">
      {items.map((item) => (
        <li key={item.key} className={styles.item}>
          <span className={styles.icon}>
            <SpriteImage src={summarySprite} crop={item.icon} />
          </span>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.value}>{item.value}</span>
          {item.note && <span className={styles.note}>{item.note}</span>}
        </li>
      ))}
    </ul>
  )
}
