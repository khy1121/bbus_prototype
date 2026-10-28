import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components'
import { DriveStartSheet } from '@/features/drive-start/DriveStartSheet'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useDriveStore } from '@/stores/driveStore'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { SideNav } from './SideNav'
import styles from './AppLayout.module.scss'

/**
 * 최상위 레이아웃
 * - 모바일/태블릿: 단일 컬럼 (탭 화면은 TabLayout 이 하단 네비를 붙인다)
 * - 데스크톱(≥1024): 좌측 사이드바 + 콘텐츠
 * 드라이브명 입력 팝업을 전역으로 렌더링한다.
 */
export function AppLayout() {
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()
  const carName = useUserStore((s) => s.carName)
  const startDrive = useDriveStore((s) => s.startDrive)
  const { driveStart, openDriveStart, closeDriveStart } = useUiStore()

  const handleStart = (name: string) => {
    startDrive({ name, destination: driveStart.destination })
    closeDriveStart()
    navigate('/drive')
  }

  return (
    <div className={styles.app}>
      {isDesktop && <SideNav onDriveClick={() => openDriveStart()} />}
      <div className={styles.main}>
        <Outlet />
        <div id="overlay-root" />
      </div>
      <DriveStartSheet open={driveStart.open} carName={carName} onClose={closeDriveStart} onStart={handleStart} />
    </div>
  )
}

/** 하단 네비가 있는 탭 화면 (홈/기록 지도/스튜디오/마이) */
export function TabLayout() {
  const isDesktop = useIsDesktop()
  const openDriveStart = useUiStore((s) => s.openDriveStart)
  return (
    <div className={styles.tab}>
      <div className={styles.tabContent}>
        <Outlet />
      </div>
      {!isDesktop && <BottomNav className={styles.bottomNav} onDriveClick={() => openDriveStart()} />}
    </div>
  )
}
