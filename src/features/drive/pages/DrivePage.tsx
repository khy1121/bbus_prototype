import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog, DraggableSheet, SegmentedControl, type SnapPoint } from '@/components'
import { KakaoMap, type LatLng } from '@/components/KakaoMap/KakaoMap'
import { DriveStartSheet } from '@/features/drive-start/DriveStartSheet'
import { LocationPermissionDialog } from '@/features/permissions/LocationPermissionDialog'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cumulativeKm, pointAtKm } from '@/lib/geo'
import { useDriveStore } from '@/stores/driveStore'
import { getRestStops, getCurrentLocation } from '../api'
import { icons, images } from '../assets'
import { ContentPanel } from '../components/ContentPanel'
import { DriveStatsCard } from '../components/DriveStatsCard'
import { GlassButton } from '../components/GlassButton'
import { RestStopModal } from '../components/RestStopModal'
import { StampPanel } from '../components/StampPanel'
import { usePlayerStore } from '../stores/playerStore'
import { useDriveDataStore } from '../stores/driveDataStore'
import { routeProgress, useDriveSessionStore } from '../stores/driveSessionStore'
import { useRadioStore } from '../stores/radioStore'
import type { RestStop } from '../types'
import { findRestStopAlert, formatAlertDistance } from '../utils/restStopAlert'
import styles from './DrivePage.module.scss'

type Tab = 'content' | 'stamp'
const TABS = [
  { value: 'content', label: '콘텐츠' },
  { value: 'stamp', label: '휴게소 스탬프' },
] as const

function useSheetHeights(): Record<SnapPoint, number> {
  const [vh, setVh] = useState(() => window.innerHeight || 844)
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return useMemo(() => ({ collapsed: 132, half: Math.round(vh * 0.32), full: Math.round(vh * 0.86) }), [vh])
}

function imageMarker(src: string, size: number, label?: string) {
  return () => {
    const el = document.createElement('img')
    el.src = src
    el.alt = label ?? ''
    el.style.width = `${size}px`
    el.style.height = 'auto'
    return el
  }
}

/** 01 첫 진입 / 04 드라이브(경로 안내) / 16 주행 중단 */
export function DrivePage() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const { status, driveName, destination, renameDrive, pause, resume, endDrive } = useDriveStore()
  const { route, elapsedSec, dismissedRestStopIds, dismissRestStopAlert } = useDriveSessionStore()
  const stamps = useDriveDataStore((s) => s.stamps)
  const resetPlayer = usePlayerStore((s) => s.reset)
  const stopRadio = useRadioStore((s) => s.stop)

  const [tab, setTab] = useState<Tab>('content')
  const [snap, setSnap] = useState<SnapPoint>('half')
  const [renameOpen, setRenameOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [restStops, setRestStops] = useState<RestStop[]>([])
  const [selectedStop, setSelectedStop] = useState<RestStop | null>(null)
  const [locationError, setLocationError] = useState(false)
  const [myPosition, setMyPosition] = useState({ lat: 37.4837, lng: 127.0324 })
  const heights = useSheetHeights()

  useEffect(() => {
    getRestStops().then(setRestStops)
    getCurrentLocation()
      .then((loc) => setMyPosition(loc.position))
      .catch(() => setLocationError(true))
  }, [])

  const hasRoute = Boolean(destination && route)
  const progress = route ? routeProgress(route, elapsedSec) : 0
  const pathKm = useMemo(() => (route ? cumulativeKm(route.path) : null), [route])
  // 경로를 따라 실제 거리 비율만큼 이동한 지점 (길찾기 좌표는 점 간격이 고르지 않음)
  const carPosition =
    route && pathKm ? pointAtKm(route.path, pathKm[pathKm.length - 1] * progress, pathKm) : myPosition
  const stats = hasRoute
    ? {
        elapsedSec,
        distanceKm: route!.distanceKm * progress,
        arrival: new Date(Date.now() + (route!.durationMin * 60 - elapsedSec) * 1000),
      }
    : { elapsedSec: null, distanceKm: null, arrival: null }

  // 카카오내비처럼: 기본은 차량을 따라가고, 사용자가 지도를 끌면 그 자리에 멈춘다. '현재 위치'로 다시 따라간다.
  const [pinnedCenter, setPinnedCenter] = useState<LatLng | null>(null)
  const mapCenter = pinnedCenter ?? carPosition
  const stopFollowing = () => setPinnedCenter((prev) => prev ?? carPosition)
  const handleLocate = () => {
    setPinnedCenter(null)
    if (!hasRoute)
      getCurrentLocation({ fresh: true })
        .then((l) => setMyPosition(l.position))
        .catch(() => setLocationError(true))
  }

  const markers = useMemo(() => {
    if (!route || !destination)
      return [{ id: 'me', position: myPosition, render: imageMarker(images.carMarker, 53, '현재 위치') }]
    return [
      { id: 'start', position: route.path[0], render: imageMarker(icons.markerStart, 20) },
      ...route.restStops.map((stop) => ({
        id: stop.id,
        position: stop.position,
        render: imageMarker(images.restStop, 53, stop.name),
        onClick: () => setSelectedStop(stop),
      })),
      { id: 'dest', position: destination.position, render: imageMarker(images.heartMarker, 54, destination.name) },
      { id: 'car', position: carPosition, render: imageMarker(images.carMarker, 53, '현재 위치'), zIndex: 10 },
    ]
  }, [route, destination, myPosition, carPosition])

  const restStopAlert =
    hasRoute && status === 'driving' ? findRestStopAlert(route!, route!.distanceKm * progress, dismissedRestStopIds) : null

  const handleEnd = () => {
    setExitOpen(false)
    endDrive()
    resetPlayer()
    stopRadio()
    navigate('/')
  }

  const panel = tab === 'content' ? <ContentPanel /> : <StampPanel restStops={restStops} />
  const tabs = <SegmentedControl label="드라이브 콘텐츠" options={TABS} value={tab} onChange={setTab} />
  const paused = status === 'paused'

  return (
    <div className={styles.page} style={{ ['--sheet-h' as string]: `${isDesktop ? 0 : heights[snap]}px` }}>
      <div className={styles.mapArea}>
        <KakaoMap
          label="드라이브 지도"
          center={mapCenter}
          onUserDrag={stopFollowing}
          level={hasRoute ? 8 : 5}
          markers={markers}
          path={route?.path}
          fitBounds={hasRoute}
          className={paused ? styles.blurred : undefined}
        />

        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.namePill}
            aria-label={`드라이브명 수정: ${driveName}`}
            onClick={() => setRenameOpen(true)}
          >
            <img src={icons.carLine} alt="" aria-hidden />
            <span>{driveName}</span>
          </button>
          <GlassButton icon={icons.route} label="경로 탐색" onClick={() => navigate('/drive/search')} />
        </div>

        <div className={styles.overlayBottom}>
          {restStopAlert && (
            <div className={styles.toast} role="status">
              <span>{`전방 ${formatAlertDistance(restStopAlert.remainingKm)} 앞에 ${restStopAlert.stop.name}가 있어요.`}</span>
              <button type="button" aria-label="알림 닫기" onClick={() => dismissRestStopAlert(restStopAlert.stop.id)}>
                <img src={icons.closeSmall} alt="" aria-hidden />
              </button>
            </div>
          )}
          <div className={styles.mapButtons}>
            {destination && <GlassButton icon={icons.exit} label="드라이브 나가기" onClick={() => setExitOpen(true)} />}
            {destination && <GlassButton icon={icons.stop} label="주행 중단" onClick={pause} disabled={paused} />}
            <GlassButton icon={icons.locate} label="현재 위치" onClick={handleLocate} />
          </div>
          <DriveStatsCard {...stats} className={styles.stats} />
        </div>

        {paused && (
          <button type="button" className={styles.paused} onClick={resume} aria-label="기록이 중단되었어요. 화면을 탭하면 주행을 다시 시작해요.">
            <span className={styles.pausedTitle}>기록이 중단되었어요.</span>
            <span className={styles.pausedDesc}>화면을 탭하면 주행을 다시 시작해요.</span>
          </button>
        )}
      </div>

      {isDesktop ? (
        <aside className={styles.sidePanel}>
          {tabs}
          <div className={styles.sideContent}>{panel}</div>
        </aside>
      ) : (
        <DraggableSheet snap={snap} onSnapChange={setSnap} heights={heights} header={tabs}>
          {panel}
        </DraggableSheet>
      )}

      <DriveStartSheet
        open={renameOpen}
        mode="rename"
        initialName={driveName}
        onClose={() => setRenameOpen(false)}
        onStart={(name) => {
          renameDrive(name)
          setRenameOpen(false)
        }}
      />
      <ConfirmDialog
        open={exitOpen}
        title="드라이브를 마치시겠어요?"
        description={'조금 더 달리고 싶다면\n경로를 수정해 보세요.'}
        cancelLabel="경로 수정"
        confirmLabel="드라이브 종료"
        onCancel={() => {
          setExitOpen(false)
          navigate('/drive/search')
        }}
        onConfirm={handleEnd}
        onClose={() => setExitOpen(false)}
      />
      <LocationPermissionDialog
        open={locationError}
        onClose={() => setLocationError(false)}
        onOpenSettings={() => {
          setLocationError(false)
          getCurrentLocation({ fresh: true })
            .then((l) => setMyPosition(l.position))
            .catch(() => setLocationError(true))
        }}
      />
      <RestStopModal restStop={selectedStop} acquired={Boolean(selectedStop && stamps[selectedStop.id])} onClose={() => setSelectedStop(null)} />
    </div>
  )
}
