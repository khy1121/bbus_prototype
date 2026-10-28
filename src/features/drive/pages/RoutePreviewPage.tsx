import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, EmptyState, IconButton } from '@/components'
import { KakaoMap } from '@/components/KakaoMap/KakaoMap'
import { useDriveStore } from '@/stores/driveStore'
import { getCurrentLocation, getPlace, getRoute } from '../api'
import type { DriveRoute, Place } from '../types'
import styles from './RoutePreviewPage.module.scss'

/** 경로 미리보기 → '경로 설정하기' (Figma 10:16587) */
export function RoutePreviewPage() {
  const { placeId = '' } = useParams()
  const navigate = useNavigate()
  const setDestination = useDriveStore((s) => s.setDestination)
  const [place, setPlace] = useState<Place | null | undefined>(undefined)
  const [route, setRoute] = useState<DriveRoute | null>(null)
  const [address, setAddress] = useState('')

  useEffect(() => {
    getCurrentLocation().then((l) => setAddress(l.address))
    getPlace(placeId).then(async (p) => {
      setPlace(p ?? null)
      if (p) setRoute(await getRoute(p))
    })
  }, [placeId])

  if (place === null) {
    return <EmptyState title="장소를 찾을 수 없어요" action={{ label: '다시 검색하기', onClick: () => navigate('/drive/search') }} />
  }

  const handleConfirm = () => {
    if (!place) return
    setDestination({ id: place.id, name: place.name, address: place.address, position: place.position })
    navigate('/drive')
  }

  return (
    <div className={styles.page}>
      <div className={styles.summary}>
        <IconButton icon="back" label="뒤로가기" variant="plain" onClick={() => navigate(-1)} />
        <div className={styles.texts}>
          <p className={styles.from}>
            내 위치 <span>{address && `(${address})`}</span>
          </p>
          <p className={styles.to}>{place?.name}</p>
        </div>
      </div>
      <div className={styles.map}>
        {place && (
          <KakaoMap
            label={`${place.name} 경로 미리보기`}
            center={place.position}
            path={route?.path}
            markers={route ? [{ id: 'dest', position: place.position }, { id: 'start', position: route.path[0] }] : []}
            fitBounds
          />
        )}
      </div>
      <div className={styles.footer}>
        <Button size="lg" fullWidth onClick={handleConfirm} disabled={!place}>
          경로 설정하기
        </Button>
      </div>
    </div>
  )
}
