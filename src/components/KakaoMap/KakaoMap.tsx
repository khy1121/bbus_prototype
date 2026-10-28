import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { cumulativeKm, remainingPath } from '@/lib/geo'
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
  /** 바뀌면 오버레이는 유지한 채 render() 로 내용만 다시 그린다 (예: 차량 진행 방향 이미지) */
  contentKey?: string
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
  /** 경로 시작점부터 이미 지나온 거리(km). 주면 그 이후만 그린다 (범위 맞춤은 전체 경로 기준) */
  pathProgressKm?: number
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
  pathProgressKm,
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

  // 모바일: 지도 위 핀치가 지도 확대 대신 브라우저(페이지) 확대로 처리되지 않게 막는다.
  // 지도 화면에만 적용 — 다른 화면에서는 사용자가 페이지를 확대할 수 있어야 한다(접근성).
  useEffect(() => {
    const root = rootRef.current
    if (!root || !interactive) return
    const prevent = (e: Event) => e.preventDefault()
    // 두 손가락 이동 = 핀치. 한 손가락(지도 이동)은 건드리지 않는다
    const preventPinch = (e: Event) => {
      if ((e as TouchEvent).touches?.length > 1) e.preventDefault()
    }
    // 카카오맵이 내부에서 이벤트 전파를 멈춰도 막을 수 있도록 캡처 단계에서 처리 (지도 동작은 그대로)
    const opts = { capture: true, passive: false } as const
    const gestures = ['gesturestart', 'gesturechange', 'gestureend']
    gestures.forEach((t) => root.addEventListener(t, prevent, opts))
    root.addEventListener('touchmove', preventPinch, opts)

    // 카카오톡 등 인앱 브라우저(WKWebView)는 viewport 확대 제한을 따른다 — 지도 화면에 있는 동안만 잠금
    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
    const original = meta?.content
    if (meta && original !== undefined) {
      meta.content = `${original}, maximum-scale=1, user-scalable=no`
    }

    return () => {
      gestures.forEach((t) => root.removeEventListener(t, prevent, opts))
      root.removeEventListener('touchmove', preventPinch, opts)
      if (meta && original !== undefined) meta.content = original
    }
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

  // 마커 — id 기준으로 유지한다. 위치만 바뀐 마커(운행 중 차량)는 옮기기만 하고 다시 만들지 않는다.
  // (매번 지우고 다시 그리면 확대·축소 애니메이션 도중 마커가 깜빡이거나 어긋나 보인다)
  const overlaysRef = useRef(new Map<string, { overlay: kakao.maps.CustomOverlay; marker: MapMarker }>())
  useEffect(() => {
    const map = mapRef.current
    const k = window.kakao
    if (status !== 'ready' || !map || !k) return
    const current = overlaysRef.current
    const nextIds = new Set(markers.map((m) => m.id))
    const createContent = (m: MapMarker) => {
      const content = m.render ? m.render() : defaultMarker()
      if (m.onClick) {
        content.style.cursor = 'pointer'
        content.addEventListener('click', () => current.get(m.id)?.marker.onClick?.())
      }
      return content
    }

    // 사라진 마커 제거
    for (const [id, entry] of current) {
      if (!nextIds.has(id)) {
        entry.overlay.setMap(null)
        current.delete(id)
      }
    }

    for (const m of markers) {
      const entry = current.get(m.id)
      if (entry) {
        const prev = entry.marker
        if (prev.position.lat !== m.position.lat || prev.position.lng !== m.position.lng) {
          entry.overlay.setPosition(new k.maps.LatLng(m.position.lat, m.position.lng))
        }
        if (prev.zIndex !== m.zIndex && m.zIndex !== undefined) entry.overlay.setZIndex(m.zIndex)
        if (prev.contentKey !== m.contentKey) entry.overlay.setContent(createContent(m))
        entry.marker = m // 클릭 핸들러는 항상 최신 마커 기준
        continue
      }
      const overlay = new k.maps.CustomOverlay({
        position: new k.maps.LatLng(m.position.lat, m.position.lng),
        content: createContent(m),
        yAnchor: 1,
        zIndex: m.zIndex,
        clickable: m.clickable ?? Boolean(m.onClick),
      })
      overlay.setMap(map)
      current.set(m.id, { overlay, marker: m })
    }
  }, [status, markers])

  // 지도가 사라질 때 마커 정리
  useEffect(() => {
    const current = overlaysRef.current
    return () => {
      current.forEach((entry) => entry.overlay.setMap(null))
      current.clear()
    }
  }, [])

  // 경로선 — 경로가 바뀔 때만 새로 만든다. 내비 스타일: 흰 테두리(아래) + 코랄 선(위)
  const polylinesRef = useRef<kakao.maps.Polyline[]>([])
  const pathAcc = useMemo(() => (path && path.length > 1 ? cumulativeKm(path) : null), [path])
  useEffect(() => {
    const map = mapRef.current
    const k = window.kakao
    if (status !== 'ready' || !map || !k || !path || path.length < 2) return
    const latLngs = path.map((p) => new k.maps.LatLng(p.lat, p.lng))
    const line = (strokeWeight: number, strokeColor: string) =>
      new k.maps.Polyline({ path: latLngs, strokeWeight, strokeColor, strokeOpacity: 1, strokeStyle: 'solid' })
    const polylines = [line(11, colors.white), line(7, colors.coral)]
    polylines.forEach((l) => l.setMap(map))
    polylinesRef.current = polylines
    return () => {
      polylines.forEach((l) => l.setMap(null))
      polylinesRef.current = []
    }
  }, [status, path])

  // 지나온 길 숨기기 — 진행할 때마다 선을 다시 만들지 않고 좌표만 바꾼다 (확대·축소 중 깜빡임 방지)
  useEffect(() => {
    const k = window.kakao
    if (status !== 'ready' || !k || !path || !pathAcc || pathProgressKm === undefined) return
    const visible = remainingPath(path, pathProgressKm, pathAcc).map((p) => new k.maps.LatLng(p.lat, p.lng))
    polylinesRef.current.forEach((l) => l.setPath(visible))
  }, [status, path, pathAcc, pathProgressKm])

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
