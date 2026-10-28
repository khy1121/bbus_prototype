import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Chip, EmptyState, HashTag, Icon, IconButton, TopBar } from '@/components'
import { LocationPermissionDialog } from '@/features/permissions/LocationPermissionDialog'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import pinLg from '../assets/pin-lg.svg'
import { fetchPlaceDetail, sendPlaceToPartner } from '../api'
import { DriveSummary } from '../components/DriveSummary'
import { PhotoSlider } from '../components/PhotoSlider'
import { PhotoViewer } from '../components/PhotoViewer'
import { RoutePreview } from '../components/RoutePreview'
import { SendToPartnerDialog } from '../components/SendToPartnerDialog'
import { ShareSheet, type ShareChannel } from '../components/ShareSheet'
import { SpriteImage } from '../components/SpriteImage'
import { useHomeStore } from '../homeStore'
import { useLocationPermission } from '../hooks/useLocationPermission'
import { CATEGORIES, MOCK_CURRENT_POSITION } from '../mocks'
import { CATEGORY_ICONS, categorySprite } from '../sprites'
import type { PlaceDetail } from '../types'
import styles from './PlaceDetailPage.module.scss'

/** TODO(share): 카카오 SDK / 인스타 스토리 / X·페이스북 공유 연동. 앱 미설치 시 웹으로 이동 */
function shareTo(channel: ShareChannel, url: string, text: string) {
  const encoded = encodeURIComponent(url)
  const links: Partial<Record<ShareChannel, string>> = {
    x: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
  }
  const link = links[channel]
  if (link) window.open(link, '_blank', 'noopener')
}

/** 스마트 탐색 상세 — 기능명세서(홈) 4️⃣ (Figma 10:6453) */
export function PlaceDetailPage() {
  const { placeId = '' } = useParams()
  const navigate = useNavigate()
  const { partnerName, partnerLinked } = useUserStore()
  const openDriveStart = useUiStore((s) => s.openDriveStart)
  const liked = useHomeStore((s) => s.likedIds.includes(placeId))
  const toggleLike = useHomeStore((s) => s.toggleLike)
  const location = useLocationPermission()

  const [place, setPlace] = useState<PlaceDetail | null | undefined>(undefined)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [permissionOpen, setPermissionOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setPlace(undefined)
    fetchPlaceDetail(placeId).then((p) => !cancelled && setPlace(p))
    return () => {
      cancelled = true
    }
  }, [placeId])

  if (place === undefined) return <div className={styles.page} aria-busy="true" />

  if (place === null) {
    return (
      <div className={styles.page}>
        <TopBar onBack={() => navigate(-1)} />
        <EmptyState title="장소를 찾을 수 없어요" description="삭제되었거나 잘못된 링크예요." />
      </div>
    )
  }

  const category = CATEGORIES.find((c) => c.id === place.category)!
  const meta = `${place.address} · ${location.granted ? place.duration : '- -'}`

  const handleSend = async () => {
    if (!partnerLinked) {
      setSendOpen(false)
      navigate('/couple/invite') // TODO: 커플 코드 입력 및 초대 화면 (온보딩 범위)
      return
    }
    await sendPlaceToPartner(place.id)
  }

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.media}>
          <PhotoSlider photos={place.photos} alt={place.name} onOpen={setViewerIndex} />
          <TopBar
            transparent
            className={styles.topBar}
            onBack={() => navigate(-1)}
            right={
              <>
                <IconButton
                  icon="heart"
                  activeIcon="heart-filled"
                  label="찜하기"
                  pressed={liked}
                  onClick={() => toggleLike(place.id)}
                />
                <IconButton icon="share" label="공유하기" onClick={() => setShareOpen(true)} />
              </>
            }
          />
        </div>

        <article className={styles.sheet}>
          <div className={styles.titleRow}>
            <div className={styles.titleBlock}>
              <h1 className={styles.name}>{place.name}</h1>
              <p className={styles.meta}>
                <img src={pinLg} alt="" />
                <span>{meta}</span>
              </p>
            </div>
            <Chip
              tabIndex={-1}
              className={styles.categoryChip}
              icon={<SpriteImage src={categorySprite} crop={CATEGORY_ICONS[place.category]} />}
            >
              {category.label}
            </Chip>
          </div>

          <div className={styles.tags}>
            {place.hashtags.map((tag) => (
              <HashTag key={tag} size="md">
                {tag}
              </HashTag>
            ))}
          </div>

          <p className={styles.intro}>{place.intro}</p>

          <ul className={styles.thumbs} aria-label="장소 사진">
            {place.photos.slice(0, 3).map((src, i) => (
              <li key={`${src}-${i}`} className={styles.thumb}>
                <img src={src} alt="" />
                {i === 2 && place.photos.length > 3 && (
                  <span className={styles.more}>{`+${place.photos.length - 3}`}</span>
                )}
              </li>
            ))}
          </ul>

          <DriveSummary summary={place.summary} locationGranted={location.granted} />

          <RoutePreview
            start={MOCK_CURRENT_POSITION}
            end={place.position}
            waypoints={place.waypoints}
            locationGranted={location.granted}
            onRequestPermission={() => setPermissionOpen(true)}
          />

          <div className={styles.actions}>
            <Button variant="secondary" size="md" leftIcon={<Icon name="send-heart" />} onClick={() => setSendOpen(true)}>
              연인에게 보내기
            </Button>
            <Button
              size="md"
              leftIcon={<Icon name="car-button" />}
              onClick={() =>
                openDriveStart({ id: place.id, name: place.name, address: place.address, position: place.position })
              }
            >
              드라이브 시작하기
            </Button>
          </div>
        </article>
      </div>

      <PhotoViewer
        open={viewerIndex !== null}
        photos={place.photos}
        initialIndex={viewerIndex ?? 0}
        alt={place.name}
        onClose={() => setViewerIndex(null)}
      />
      <ShareSheet
        open={shareOpen}
        place={place}
        onClose={() => setShareOpen(false)}
        onShare={(channel) => shareTo(channel, place.shareUrl, place.name)}
      />
      <SendToPartnerDialog open={sendOpen} partnerName={partnerName} onClose={() => setSendOpen(false)} onSend={handleSend} />
      <LocationPermissionDialog
        open={permissionOpen}
        onClose={() => setPermissionOpen(false)}
        onOpenSettings={async () => {
          setPermissionOpen(false)
          await location.request()
        }}
      />
    </div>
  )
}
