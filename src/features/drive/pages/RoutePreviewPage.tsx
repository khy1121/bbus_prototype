import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button, EmptyState, IconButton } from '@/components'
import { KakaoMap } from '@/components/KakaoMap/KakaoMap'
import { LocationPermissionDialog } from '@/features/permissions/LocationPermissionDialog'
import { useDriveStore, type Destination } from '@/stores/driveStore'
import { getCurrentLocation, getPlace, getRoute } from '../api'
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

  const label = (e: Endpoint | null) =>
    e?.isMe ? (
      <>
        내 위치 <span>{e.address && `(${e.address})`}</span>
      </>
    ) : (
      e?.name
    )

  return (
    <div className={styles.page}>
      <div className={styles.summary}>
        <IconButton icon="back" label="뒤로가기" variant="plain" onClick={() => navigate(-1)} />
        <div className={styles.texts}>
          <p className={styles.from}>{label(from)}</p>
          <p className={styles.to}>{label(to ?? null)}</p>
        </div>
      </div>
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
      <div className={styles.footer}>
        <Button size="lg" fullWidth onClick={handleConfirm} disabled={!from || !to}>
          경로 설정하기
        </Button>
      </div>

      <LocationPermissionDialog open={locationError} onClose={() => setLocationError(false)} onOpenSettings={load} />
    </div>
  )
}
