import clsx from 'clsx'
import styles from './ProgressBar.module.scss'

type ProgressBarProps = {
  label: string
  value: number
  max: number
  className?: string
}

export function ProgressBar({ label, value, max, className }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={clsx(styles.track, className)}
    >
      <div className={styles.fill} data-testid="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
