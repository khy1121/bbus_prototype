import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Button } from '../Button/Button'
import styles from './EmptyState.module.scss'

type EmptyStateProps = {
  title: string
  description?: string
  illustration?: ReactNode
  action?: { label: string; onClick: () => void }
  className?: string
}

/** 빈 상태 (디자인 없음 → 프로젝트 스타일로 추가) */
export function EmptyState({ title, description, illustration, action, className }: EmptyStateProps) {
  return (
    <div className={clsx(styles.empty, className)}>
      {illustration}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick} className={styles.action}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
