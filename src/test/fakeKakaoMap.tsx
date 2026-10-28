import { useEffect, useRef, type ReactNode } from 'react'
import type { LatLng, MapMarker } from '@/components/KakaoMap/KakaoMap'

type FakeProps = {
  label: string
  center?: LatLng
  markers?: MapMarker[]
  onUserDrag?: () => void
  pathProgressKm?: number
  children?: ReactNode
}

/**
 * 테스트용 카카오맵 — SDK 없이 마커 DOM(render())을 그대로 그려서 클릭 흐름을 검증한다.
 * 현재 중심 좌표는 data-center 로 노출하고, '지도 끌기' 버튼으로 사용자 드래그를 흉내 낸다.
 * 사용: vi.mock('@/components/KakaoMap/KakaoMap', async () => (await import('@/test/fakeKakaoMap')).fakeKakaoMapModule)
 */
function FakeKakaoMap({ label, center, markers = [], onUserDrag, pathProgressKm, children }: FakeProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.replaceChildren(...markers.map((m) => m.render?.() ?? document.createElement('span')))
  }, [markers])
  return (
    <div
      role="region"
      aria-label={label}
      data-center={center ? `${center.lat},${center.lng}` : ''}
      data-path-progress={pathProgressKm ?? ''}
    >
      <div ref={ref} />
      {onUserDrag && (
        <button type="button" onClick={onUserDrag}>
          지도 끌기
        </button>
      )}
      {children}
    </div>
  )
}

export const fakeKakaoMapModule = { KakaoMap: FakeKakaoMap }
