import { useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { getKakaoMapKey, loadKakaoMaps } from '@/lib/kakao/loadKakaoMaps'
import { colors } from '@/styles/tokens'
import styles from './KakaoMap.module.scss'

export type LatLng = { lat: number; lng: number }

export type MapMarker = {
  id: string
  position: LatLng
  /** 마커로 쓸 DOM (커스텀 오버레이). 없으면 기본 코랄 점 */
  render?: () => HTMLElement
  onClick?: () => void
  /** 마커 DOM 이 스스로 클릭을 처리할 때(예: <button>) true — 지도가 클릭을 가로채지 않게 한다 */
  clickable?: boolean
  zIndex?: number
}

type KakaoMapProps = {
  /** 지도 접근성 이름 */
  label: string
  center: LatLng
  level?: number
  markers?: MapMarker[]
  /** 경로 폴리라인 */
  path?: LatLng[]
  /** 경로/마커가 모두 보이도록 범위 맞춤 */
  fitBounds?: boolean
  /** false 면 드래그/줌 불가 (읽기 전용 미리보기) */
  interactive?: boolean
  /** 지도 위에 띄울 UI */
  children?: ReactNode
  className?: string
}

function defaultMarker(): HTMLElement {
  const el = document.createElement('span')
  el.className = styles.dot
  return el
}

/**
 * 카카오맵 래퍼. VITE_KAKAO_MAP_KEY 가 없거나 SDK 로드에 실패하면 플레이스홀더를 그린다.
 */
export function KakaoMap({
  label,
  center,
  level = 6,
  markers = [],
  path,
  fitBounds = false,
  interactive = true,
  children,
  className,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>(getKakaoMapKey() ? 'loading' : 'unavailable')

  // 지도 생성
  useEffect(() => {
    if (status === 'unavailable') return
    let cancelled = false
    loadKakaoMaps()
      .then((k) => {
        if (cancelled || !containerRef.current) return
        mapRef.current = new k.maps.Map(containerRef.current, {
          center: new k.maps.LatLng(center.lat, center.lng),
          level,
          draggable: interactive,
          scrollwheel: interactive,
          disableDoubleClickZoom: !interactive,
        })
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('unavailable'))
    return () => {
      cancelled = true
    }
    // 최초 1회만 생성 — 이후 변경은 아래 effect 에서 반영
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (status !== 'ready' || !map || !window.kakao) return
    map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng))
    map.setLevel(level)
  }, [status, center.lat, center.lng, level])

  // 마커 + 폴리라인
  useEffect(() => {
    const map = mapRef.current
    const k = window.kakao
    if (status !== 'ready' || !map || !k) return

    const overlays = markers.map((m) => {
      const content = m.render ? m.render() : defaultMarker()
      if (m.onClick) {
        content.style.cursor = 'pointer'
        content.addEventListener('click', m.onClick)
      }
      const overlay = new k.maps.CustomOverlay({
        position: new k.maps.LatLng(m.position.lat, m.position.lng),
        content,
        yAnchor: 1,
        zIndex: m.zIndex,
        clickable: m.clickable ?? Boolean(m.onClick),
      })
      overlay.setMap(map)
      return overlay
    })

    const polyline =
      path && path.length > 1
        ? new k.maps.Polyline({
            path: path.map((p) => new k.maps.LatLng(p.lat, p.lng)),
            strokeWeight: 6,
            strokeColor: colors.coral,
            strokeOpacity: 0.9,
            strokeStyle: 'solid',
          })
        : null
    polyline?.setMap(map)

    return () => {
      overlays.forEach((o) => o.setMap(null))
      polyline?.setMap(null)
    }
  }, [status, markers, path])

  // 범위 맞춤 — 경로나 마커 구성(id)이 바뀔 때만. 차량 마커가 움직일 때마다 화면이 튀지 않게 한다.
  const fitKey = fitBounds ? `${JSON.stringify(path ?? [])}|${markers.map((m) => m.id).join(',')}` : ''
  useEffect(() => {
    const map = mapRef.current
    const k = window.kakao
    if (status !== 'ready' || !map || !k || !fitKey) return
    const points = [...(path ?? []), ...markers.map((m) => m.position)]
    if (points.length < 2) return
    const bounds = new k.maps.LatLngBounds()
    points.forEach((p) => bounds.extend(new k.maps.LatLng(p.lat, p.lng)))
    map.setBounds(bounds, 40, 40, 40, 40)
    // fitKey 가 바뀔 때만 실행 (markers/path 의 최신 값은 그 시점 값을 사용)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, fitKey])

  return (
    <div className={clsx(styles.root, className)} role="region" aria-roledescription="지도" aria-label={label}>
      {status === 'unavailable' ? (
        <div className={styles.placeholder} data-testid="kakao-map-placeholder">
          <span className={styles.placeholderText}>
            지도를 표시하려면 .env 에 VITE_KAKAO_MAP_KEY 를 설정하세요.
          </span>
        </div>
      ) : (
        <div ref={containerRef} className={styles.map} />
      )}
      {children}
    </div>
  )
}
