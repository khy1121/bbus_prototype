import clsx from 'clsx'
import styles from './HashTag.module.scss'

type HashTagProps = {
  children: string
  /** sm: 카드용 (caption-bold) · md: 상세 화면용 (body-s-medium) */
  size?: 'sm' | 'md'
  className?: string
}

export function HashTag({ children, size = 'sm', className }: HashTagProps) {
  const label = children.startsWith('#') ? children : `#${children}`
  return <span className={clsx(styles.hashTag, styles[size], className)}>{label}</span>
}
