import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import { Icon } from '../Icon/Icon'
import type { IconName } from '../Icon/icons'
import styles from './IconButton.module.scss'

/**
 * glass: 36px 원형 글래스 버튼 (뒤로가기/공유/찜, 지도 위 버튼)
 * soft: 28px 디바이더 배경 원형 (팝업 닫기)
 * plain: 배경 없음 (헤더 아이콘)
 */
export type IconButtonVariant = 'glass' | 'soft' | 'plain'

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: IconName
  activeIcon?: IconName
  label: string
  variant?: IconButtonVariant
  /** 토글형 버튼(찜 등)의 눌림 상태 */
  pressed?: boolean
}

export function IconButton({
  icon,
  activeIcon,
  label,
  variant = 'glass',
  pressed,
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  const iconName = pressed && activeIcon ? activeIcon : icon
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed === undefined ? undefined : pressed}
      className={clsx(styles.iconButton, styles[variant], className)}
      {...rest}
    >
      <Icon name={iconName} />
    </button>
  )
}
