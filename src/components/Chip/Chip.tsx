import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import styles from './Chip.module.scss'

/**
 * category: 홈 큐레이션 카테고리 칩 (36px, 흰 배경 → 선택 시 코랄2 + 코랄stroke)
 * keyword: DJ 취향 선택 칩 (28px, 라운드 풀)
 */
export type ChipVariant = 'category' | 'keyword'

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ChipVariant
  selected?: boolean
  icon?: ReactNode
}

export function Chip({
  variant = 'category',
  selected = false,
  icon,
  type = 'button',
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={clsx(styles.chip, styles[variant], selected && styles.selected, className)}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  )
}
