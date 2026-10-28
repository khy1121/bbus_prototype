import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { Icon } from '../Icon/Icon'
import type { IconName } from '../Icon/icons'
import styles from './BottomNav.module.scss'

type Tab = { to: string; label: string; icon: IconName; activeIcon: IconName; end?: boolean }

const LEFT_TABS: Tab[] = [
  { to: '/', label: '홈', icon: 'nav-home', activeIcon: 'nav-home-filled', end: true },
  { to: '/map', label: '기록 지도', icon: 'nav-map', activeIcon: 'nav-map-filled' },
]
const RIGHT_TABS: Tab[] = [
  { to: '/studio', label: '스튜디오', icon: 'nav-studio', activeIcon: 'nav-studio-filled' },
  { to: '/my', label: '마이', icon: 'nav-my', activeIcon: 'nav-my-filled' },
]

type BottomNavProps = {
  /** 가운데 드라이브 버튼 — 드라이브명 입력 팝업을 연다 */
  onDriveClick: () => void
  className?: string
}

/** 하단 네비게이션 (Figma 10:6889) */
export function BottomNav({ onDriveClick, className }: BottomNavProps) {
  const renderTab = (tab: Tab) => (
    <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => clsx(styles.tab, isActive && styles.active)}>
      {({ isActive }) => (
        <>
          <span className={styles.iconBox}>
            <Icon name={isActive ? tab.activeIcon : tab.icon} />
          </span>
          <span>{tab.label}</span>
        </>
      )}
    </NavLink>
  )

  return (
    <nav aria-label="하단 메뉴" className={clsx(styles.nav, className)}>
      <div className={styles.bar}>
        {LEFT_TABS.map(renderTab)}
        <div className={styles.centerSlot} aria-hidden />
        {RIGHT_TABS.map(renderTab)}
      </div>
      <button type="button" className={styles.drive} onClick={onDriveClick}>
        <span className={styles.fab}>
          <Icon name="car" />
        </span>
        <span className={styles.driveLabel}>드라이브</span>
      </button>
    </nav>
  )
}
