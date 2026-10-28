import { useEffect, useRef } from 'react'
import type { MapMarker } from '@/components/KakaoMap/KakaoMap'

/**
 * 테스트용 카카오맵 — SDK 없이 마커 DOM(render())을 그대로 그려서 클릭 흐름을 검증한다.
 * 사용: vi.mock('@/components/KakaoMap/KakaoMap', async () => (await import('@/test/fakeKakaoMap')).fakeKakaoMapModule)
 */
function FakeKakaoMap({ label, markers = [], children }: { label: string; markers?: MapMarker[]; children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.replaceChildren(...markers.map((m) => m.render?.() ?? document.createElement('span')))
  }, [markers])
  return (
    <div role="region" aria-label={label}>
      <div ref={ref} />
      {children}
    </div>
  )
}

export const fakeKakaoMapModule = { KakaoMap: FakeKakaoMap }
