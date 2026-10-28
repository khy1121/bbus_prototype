import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from './GlassButton.module.scss'

type GlassButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: string
  label: string
}

/** 지도 위 36px 글래스 원형 버튼 (경로/현재위치/나가기/중단) */
export function GlassButton({ icon, label, className, type = 'button', ...rest }: GlassButtonProps) {
  return (
    <button type={type} aria-label={label} className={clsx(styles.glassButton, className)} {...rest}>
      <img src={icon} alt="" aria-hidden />
    </button>
  )
}
