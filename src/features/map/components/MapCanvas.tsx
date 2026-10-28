import { useMemo } from 'react'
import clsx from 'clsx'
import { KakaoMap, type MapMarker } from '@/components/KakaoMap/KakaoMap'
import markerDot from '../assets/marker-dot.svg'
import markerFrame from '../assets/marker-frame.svg'
import type { DriveRecord } from '../types'
import styles from './MapCanvas.module.scss'

/** 남한 전체가 보이는 기본 중심/레벨 (기록이 없을 때) */
const KOREA_CENTER = { lat: 36.2, lng: 127.8 }
const KOREA_LEVEL = 13

type MapCanvasProps = {
  records: DriveRecord[]
  onSelect: (record: DriveRecord) => void
  className?: string
}

function img(src: string, className: string) {
  const el = document.createElement('img')
  el.src = src
  el.alt = ''
  el.className = className
  el.setAttribute('aria-hidden', 'true')
  return el
}

/** 기록 → 카카오맵 커스텀 오버레이용 사진 마커 (Figma 10:14495 마커 디자인) */
export function buildRecordMarkers(records: DriveRecord[], onSelect: (record: DriveRecord) => void): MapMarker[] {
  return records.map((record) => ({
    id: record.id,
    position: record.position,
    clickable: true,
    render: () => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = styles.marker
      button.setAttribute('aria-label', `${record.title} 기록 보기`)
      button.addEventListener('click', () => onSelect(record))

      const frame = document.createElement('span')
      frame.className = styles.frame
      const photo = img(record.thumbnail, styles.photo)
      photo.loading = 'lazy'
      frame.append(img(markerFrame, styles.frameImg), photo)

      const dot = document.createElement('span')
      dot.className = styles.dot
      dot.append(img(markerDot, ''))

      button.append(frame, dot)
      return button
    },
  }))
}

/**
 * 기록 지도 — 실제 카카오맵 위에 사진 마커를 띄운다.
 * 기록이 있으면 모든 기록이 보이도록 범위를 맞추고(제주 포함), 없으면 남한 전체를 보여준다.
 */
export function MapCanvas({ records, onSelect, className }: MapCanvasProps) {
  const markers = useMemo(() => buildRecordMarkers(records, onSelect), [records, onSelect])
  return (
    <div className={clsx(styles.viewport, className)}>
      <KakaoMap
        label="드라이브 기록 지도"
        center={KOREA_CENTER}
        level={KOREA_LEVEL}
        markers={markers}
        fitBounds={records.length > 1}
      />
    </div>
  )
}
