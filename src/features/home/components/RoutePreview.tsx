import { useMemo } from 'react'
import clsx from 'clsx'
import { KakaoMap, type LatLng, type MapMarker } from '@/components/KakaoMap/KakaoMap'
import labelBubble from '../assets/map-label.svg'
import styles from './RoutePreview.module.scss'

type RoutePreviewProps = {
  start: LatLng
  end: LatLng
  waypoints: LatLng[]
  locationGranted: boolean
  onRequestPermission: () => void
  className?: string
}

function labelMarker(text: string): () => HTMLElement {
  return () => {
    const el = document.createElement('span')
    el.className = styles.label
    el.style.backgroundImage = `url("${labelBubble}")`
    el.textContent = text
    return el
  }
}

function waypointMarker(): HTMLElement {
  const el = document.createElement('span')
  el.className = styles.waypoint
  return el
}

/** 경로 미리보기 — 읽기 전용 지도 (Figma 10:6517) */
export function RoutePreview({ start, end, waypoints, locationGranted, onRequestPermission, className }: RoutePreviewProps) {
  const path = useMemo(() => [start, ...waypoints, end], [start, waypoints, end])
  const markers = useMemo<MapMarker[]>(
    () => [
      { id: 'start', position: start, render: labelMarker('출발지'), zIndex: 3 },
      ...waypoints.map((p, i) => ({ id: `wp-${i}`, position: p, render: waypointMarker, zIndex: 2 })),
      { id: 'end', position: end, render: labelMarker('도착지'), zIndex: 3 },
    ],
    [start, end, waypoints],
  )

  return (
    <section className={clsx(styles.preview, className)} aria-labelledby="route-preview-title">
      <h2 id="route-preview-title" className={styles.title}>
        경로 미리보기
      </h2>
      <div className={styles.mapBox}>
        <KakaoMap
          label="현재 위치에서 목적지까지의 경로"
          center={end}
          markers={locationGranted ? markers : []}
          path={locationGranted ? path : undefined}
          fitBounds
          interactive={false}
          className={clsx(!locationGranted && styles.blurred)}
        />
        {!locationGranted && (
          <button type="button" className={styles.permission} onClick={onRequestPermission}>
            위치 권한을 허용하면 경로를 볼 수 있어요
          </button>
        )}
      </div>
    </section>
  )
}
