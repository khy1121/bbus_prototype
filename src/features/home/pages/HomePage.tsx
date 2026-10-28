import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlaceSummary } from '@/components'
import { LocationPermissionDialog } from '@/features/permissions/LocationPermissionDialog'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { fetchDriveConditions, fetchPlacesByCategory } from '../api'
import { CurationSection } from '../components/CurationSection'
import { DriveBanner } from '../components/DriveBanner'
import { HomeHeader } from '../components/HomeHeader'
import { useHomeStore } from '../homeStore'
import { useLocationPermission } from '../hooks/useLocationPermission'
import type { CategoryId, DriveConditions } from '../types'
import styles from './HomePage.module.scss'

// 위치 권한 안내는 세션당 한 번만
let permissionPrompted = false

/** 메인 홈 (드라이브 모드 OFF) — 기능명세서(홈) 1️⃣ 2️⃣ */
export function HomePage() {
  const navigate = useNavigate()
  const userName = useUserStore((s) => s.userName)
  const openDriveStart = useUiStore((s) => s.openDriveStart)
  const { likedIds, toggleLike, notifications, loadNotifications, hasUnread } = useHomeStore()
  const location = useLocationPermission()

  const [conditions, setConditions] = useState<DriveConditions | null>(null)
  const [category, setCategory] = useState<CategoryId>('sea')
  const [page, setPage] = useState(0)
  const [places, setPlaces] = useState<PlaceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [permissionOpen, setPermissionOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchDriveConditions()
      .then((c) => !cancelled && setConditions(c))
      .catch(() => !cancelled && setConditions(null))
    if (notifications === null) void loadNotifications()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPlacesByCategory(category, page)
      .then((list) => !cancelled && setPlaces(list))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [category, page])

  useEffect(() => {
    if (!location.granted && !permissionPrompted) {
      permissionPrompted = true
      setPermissionOpen(true)
    }
  }, [location.granted])

  // 위치 권한이 없으면 날씨·교통은 '- -'
  const shownConditions = conditions && !location.granted ? { ...conditions, weather: null, traffic: null } : conditions

  const handleCategoryChange = (next: CategoryId) => {
    setCategory(next)
    setPage(0)
  }

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <HomeHeader
          today={new Date()}
          userName={userName}
          hasUnread={hasUnread()}
          onBellClick={() => navigate('/notifications')}
        />
        <div className={styles.banners}>
          <DriveBanner conditions={shownConditions} onStart={() => openDriveStart()} className={styles.driveBanner} />
        </div>
      </div>

      <div className={styles.divider} aria-hidden />

      <div className={styles.curation}>
        <CurationSection
          category={category}
          onCategoryChange={handleCategoryChange}
          places={places}
          likedIds={likedIds}
          onToggleLike={toggleLike}
          onPlaceClick={(id) => navigate(`/places/${id}`)}
          onRefresh={() => setPage((p) => p + 1)}
          loading={loading}
        />
      </div>

      <LocationPermissionDialog
        open={permissionOpen}
        onClose={() => setPermissionOpen(false)}
        onOpenSettings={async () => {
          setPermissionOpen(false)
          await location.request()
        }}
      />
    </div>
  )
}
