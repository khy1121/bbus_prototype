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
  /** 사용자가 지도를 끌어 움직이기 시작할 때 */
  onUserDrag?: () => void
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
  onUserDrag,
  children,
  className,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>(
    getKakaoMapKey() ? 'loading' : 'unavailable',
  )

  // iOS 사파리/인앱 브라우저: 지도 위 핀치를 페이지 확대(gesture 이벤트)가 가로채지 않게 막는다.
  // 지도 영역에만 적용 — 다른 화면에서는 사용자가 페이지를 확대할 수 있어야 한다(접근성).
  useEffect(() => {
    const root = rootRef.current
    if (!root || !interactive) return
    const prevent = (e: Event) => e.preventDefault()
    const types = ['gesturestart', 'gesturechange', 'gestureend']
    types.forEach((t) => root.addEventListener(t, prevent, { passive: false }))
    return () => types.forEach((t) => root.removeEventListener(t, prevent))
  }, [interactive])

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

  // 중심 이동 — 확대 레벨은 건드리지 않는다 (운행 중 사용자가 확대해도 유지)
  useEffect(() => {
    const map = mapRef.current
    if (status !== 'ready' || !map || !window.kakao) return
    map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng))
  }, [status, center.lat, center.lng])

  // 레벨은 prop 이 바뀔 때만 적용
  useEffect(() => {
    const map = mapRef.current
    if (status !== 'ready' || !map) return
    map.setLevel(level)
  }, [status, level])

  // 사용자가 지도를 끌기 시작하면 알림 (차량 따라가기 해제용)
  const onUserDragRef = useRef(onUserDrag)
  useEffect(() => {
    onUserDragRef.current = onUserDrag
  }, [onUserDrag])
  useEffect(() => {
    const map = mapRef.current
    const k = window.kakao
    if (status !== 'ready' || !map || !k) return
    const handler = () => onUserDragRef.current?.()
    k.maps.event.addListener(map, 'dragstart', handler)
    return () => k.maps.event.removeListener(map, 'dragstart', handler)
  }, [status])

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

    // 내비 스타일 경로: 흰 테두리(아래) + 코랄 선(위)
    const routeLatLngs = path && path.length > 1 ? path.map((p) => new k.maps.LatLng(p.lat, p.lng)) : null
    const polylines = routeLatLngs
      ? [
          new k.maps.Polyline({
            path: routeLatLngs,
            strokeWeight: 11,
            strokeColor: colors.white,
            strokeOpacity: 1,
            strokeStyle: 'solid',
          }),
          new k.maps.Polyline({
            path: routeLatLngs,
            strokeWeight: 7,
            strokeColor: colors.coral,
            strokeOpacity: 1,
            strokeStyle: 'solid',
          }),
        ]
      : []
    polylines.forEach((line) => line.setMap(map))

    return () => {
      overlays.forEach((o) => o.setMap(null))
      polylines.forEach((line) => line.setMap(null))
    }
  }, [status, markers, path])

  // 범위 맞춤 — 경로나 마커 구성(id)이 바뀔 때만. 차량 마커가 움직일 때마다 화면이 튀지 않게 한다.
  // 실제 경로는 좌표가 수천 개라 전체 직렬화 대신 길이 + 양 끝점으로 식별
  const pathKey = path?.length
    ? `${path.length}:${path[0].lat},${path[0].lng}:${path[path.length - 1].lat},${path[path.length - 1].lng}`
    : ''
  const fitKey = fitBounds ? `${pathKey}|${markers.map((m) => m.id).join(',')}` : ''
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
    <div
      ref={rootRef}
      className={clsx(styles.root, interactive && styles.interactive, className)}
      role="region"
      aria-roledescription="지도"
      aria-label={label}
    >
      {status === 'unavailable' ? (
        <div className={styles.placeholder} data-testid="kakao-map-placeholder">
          <span className={styles.placeholderText}>지도를 표시하려면 .env 에 VITE_KAKAO_MAP_KEY 를 설정하세요.</span>
        </div>
      ) : (
        <div ref={containerRef} className={styles.map} />
      )}
      {children}
    </div>
  )
}
