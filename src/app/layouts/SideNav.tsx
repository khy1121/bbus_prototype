import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { Button, Icon, type IconName } from '@/components'
import styles from './SideNav.module.scss'

const TABS: { to: string; label: string; icon: IconName; activeIcon: IconName; end?: boolean }[] = [
  { to: '/', label: '홈', icon: 'nav-home', activeIcon: 'nav-home-filled', end: true },
  { to: '/map', label: '기록 지도', icon: 'nav-map', activeIcon: 'nav-map-filled' },
  { to: '/studio', label: '스튜디오', icon: 'nav-studio', activeIcon: 'nav-studio-filled' },
  { to: '/my', label: '마이', icon: 'nav-my', activeIcon: 'nav-my-filled' },
]

/** 데스크톱(≥1024px) 좌측 고정 사이드바 — 하단 네비를 대체 (디자인 없음 → 추가) */
export function SideNav({ onDriveClick }: { onDriveClick: () => void }) {
  return (
    <aside className={styles.sideNav}>
      <p className={styles.logo}>붕붕어스</p>
      <nav aria-label="메인 메뉴" className={styles.menu}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => clsx(styles.item, isActive && styles.active)}
          >
            {({ isActive }) => (
              <>
                <span className={styles.icon}>
                  <Icon name={isActive ? tab.activeIcon : tab.icon} />
                </span>
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <Button size="pill" fullWidth leftIcon={<Icon name="car-button" />} onClick={onDriveClick}>
        드라이브 시작하기
      </Button>
    </aside>
  )
}
