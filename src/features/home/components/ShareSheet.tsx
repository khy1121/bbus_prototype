import { BottomSheet } from '@/components'
import copyIcon from '../assets/copy.svg'
import pin from '../assets/pin-md.svg'
import facebook from '../assets/share-facebook.png'
import instagram from '../assets/share-instagram.png'
import kakao from '../assets/share-kakao.png'
import x from '../assets/share-x.png'
import styles from './ShareSheet.module.scss'

export type ShareChannel = 'kakao' | 'instagram' | 'x' | 'facebook'

const CHANNELS: { id: ShareChannel; label: string; icon: string }[] = [
  { id: 'kakao', label: '카카오톡', icon: kakao },
  { id: 'instagram', label: '인스타그램', icon: instagram },
  { id: 'x', label: 'X', icon: x },
  { id: 'facebook', label: '페이스북', icon: facebook },
]

type SharePlace = { name: string; region: string; duration: string; thumbnail: string; shareUrl: string }

type ShareSheetProps = {
  open: boolean
  place: SharePlace
  onClose: () => void
  onShare: (channel: ShareChannel) => void
}

/** 공유하기 바텀시트 (Figma 10:6635) */
export function ShareSheet({ open, place, onClose, onShare }: ShareSheetProps) {
  const handleCopy = () => {
    // 명세: 복사 완료 안내 텍스트 없음
    void navigator.clipboard?.writeText(place.shareUrl).catch(() => {})
  }

  return (
    <BottomSheet open={open} onClose={onClose} label="공유하기" showClose>
      <div className={styles.content}>
        <div className={styles.place}>
          <img className={styles.thumb} src={place.thumbnail} alt="" />
          <div className={styles.placeTexts}>
            <p className={styles.name}>{place.name}</p>
            <p className={styles.meta}>
              <img src={pin} alt="" />
              <span>{`${place.region} · ${place.duration}`}</span>
            </p>
          </div>
        </div>

        <div className={styles.block}>
          <p className={styles.blockTitle}>링크 공유하기</p>
          <div className={styles.link}>
            <span className={styles.url}>{place.shareUrl}</span>
            <button type="button" className={styles.copy} aria-label="링크 복사" onClick={handleCopy}>
              <img src={copyIcon} alt="" />
            </button>
          </div>
        </div>

        <div className={styles.block}>
          <p className={styles.blockTitle}>다른 방법으로 공유하기</p>
          <ul className={styles.channels}>
            {CHANNELS.map((c) => (
              <li key={c.id}>
                <button type="button" className={styles.channel} onClick={() => onShare(c.id)}>
                  <img src={c.icon} alt="" width={57} height={57} />
                  <span>{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </BottomSheet>
  )
}
