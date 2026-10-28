import type { ReactNode } from 'react'
import clsx from 'clsx'
import { IconButton } from '../IconButton/IconButton'
import styles from './TopBar.module.scss'

type TopBarProps = {
  title?: ReactNode
  onBack?: () => void
  right?: ReactNode
  /** 투명 배경 (이미지/지도 위) */
  transparent?: boolean
  className?: string
}

/** 서브 화면 상단바: [뒤로] 제목 ...[우측] */
export function TopBar({ title, onBack, right, transparent = false, className }: TopBarProps) {
  return (
    <header className={clsx(styles.topBar, transparent && styles.transparent, className)}>
      {onBack && <IconButton icon="back" label="뒤로가기" variant="plain" onClick={onBack} className={styles.back} />}
      {title && <h1 className={styles.title}>{title}</h1>}
      {right && <div className={styles.right}>{right}</div>}
    </header>
  )
}
