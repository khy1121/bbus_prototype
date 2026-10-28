import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'tonal'
/**
 * lg: 48px pill (화면 하단 CTA) · md: 50px r20 (상세 하단 버튼) · dialog: 45px r15 (팝업 버튼)
 * pill: 44px 그림자 배너 버튼 (홈 드라이브 시작하기) · sm: 36px (보조 버튼)
 */
export type ButtonSize = 'lg' | 'md' | 'dialog' | 'pill' | 'sm'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
      {...rest}
    >
      <span className={styles.content}>
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </span>
    </button>
  )
}
