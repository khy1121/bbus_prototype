import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components'
import { KakaoMap } from '@/components/KakaoMap/KakaoMap'
import { LocationPermissionDialog } from '@/features/permissions/LocationPermissionDialog'
import { useDriveStore, type Destination } from '@/stores/driveStore'
import { getCurrentLocation, getPlace, getRoute } from '../api'
import { icons } from '../assets'
import type { DriveRoute } from '../types'
import styles from './RoutePreviewPage.module.scss'

/** 'me' = 현재 위치 */
const ME_ID = 'me'

type Endpoint = Destination & { isMe: boolean }

async function resolveEndpoint(id: string): Promise<Endpoint | null> {
  if (id === ME_ID) {
    const loc = await getCurrentLocation()
    return { id: ME_ID, name: '내 위치', address: loc.address, position: loc.position, isMe: true }
  }
  const p = await getPlace(id)
  return p ? { id: p.id, name: p.name, address: p.address, position: p.position, isMe: false } : null
}

/** 경로 미리보기 → '경로 설정하기' (Figma 10:16587). /drive/route/:도착지?from=:출발지 */
export function RoutePreviewPage() {
  const { placeId = '' } = useParams()
  const [params] = useSearchParams()
  const fromId = params.get('from') ?? ME_ID
  const navigate = useNavigate()
  const location = useLocation()
  const { setOrigin, setDestination } = useDriveStore()

  const [from, setFrom] = useState<Endpoint | null>(null)
  const [to, setTo] = useState<Endpoint | null | undefined>(undefined)
  const [route, setRoute] = useState<DriveRoute | null>(null)
  const [locationError, setLocationError] = useState(false)

  const load = useCallback(async () => {
    try {
      const [f, t] = await Promise.all([resolveEndpoint(fromId), resolveEndpoint(placeId)])
      setLocationError(false)
      setFrom(f)
      setTo(t)
      if (f && t) setRoute(await getRoute(f.position, t))
    } catch {
      // 출발지나 도착지가 '내 위치'인데 위치를 못 가져온 경우
      setLocationError(true)
    }
  }, [fromId, placeId])

  useEffect(() => {
    load()
  }, [load])

  if (to === null || (from === null && to !== undefined)) {
    return <EmptyState title="장소를 찾을 수 없어요" action={{ label: '다시 검색하기', onClick: () => navigate('/drive/search') }} />
  }

  const handleConfirm = () => {
    if (!from || !to) return
    const strip = ({ id, name, address, position }: Endpoint): Destination => ({ id, name, address, position })
    setOrigin(from.isMe ? null : strip(from))
    setDestination(strip(to))
    navigate('/drive')
  }

  // 출발/도착 바꾸기 → 바뀐 경로로 다시 미리보기
  const swap = () => navigate(`/drive/route/${fromId}?from=${placeId}`, { replace: true, state: location.state })
  // 닫기 → 검색 화면으로 (검색에서 왔으면 뒤로, 링크로 바로 들어왔다면 검색 화면을 새로 연다)
  const fromSearch = (location.state as { fromSearch?: boolean } | null)?.fromSearch
  const close = () => (fromSearch ? navigate(-1) : navigate('/drive/search'))

  const label = (e: Endpoint | null | undefined) =>
    e?.isMe ? (
      <>
        내 위치 {e.address && <span className={styles.address}>{`(${e.address})`}</span>}
      </>
    ) : (
      e?.name
    )

  return (
    <div className={styles.page}>
      <div className={styles.map}>
        {to && (
          <KakaoMap
            label={`${to.name} 경로 미리보기`}
            center={to.position}
            path={route?.path}
            markers={route ? [{ id: 'dest', position: to.position }, { id: 'start', position: route.path[0] }] : []}
            fitBounds
          />
        )}
      </div>

      {/* 출발지/도착지 박스 — 장소 검색 화면과 같은 모양 (Figma 10:16590) */}
      <div className={styles.routeBox}>
        <img className={styles.routeDots} src={icons.routeDots} alt="" aria-hidden />
        <button type="button" className={styles.swap} aria-label="출발지와 도착지 바꾸기" onClick={swap}>
          <img src={icons.swap} alt="" aria-hidden />
        </button>
        <div className={styles.fields}>
          <p className={styles.from} data-testid="route-from">
            {label(from)}
          </p>
          <p className={styles.to} data-testid="route-to">
            {label(to)}
          </p>
        </div>
        <button type="button" className={styles.close} aria-label="닫기" onClick={close}>
          <img src={icons.closeLarge} alt="" aria-hidden />
        </button>
      </div>

      {/* 하단 꽉 찬 코랄 바 (Figma 10:16615) */}
      <button type="button" className={styles.confirm} onClick={handleConfirm} disabled={!from || !to}>
        경로 설정하기
      </button>

      <LocationPermissionDialog open={locationError} onClose={() => setLocationError(false)} onOpenSettings={load} />
    </div>
  )
}
