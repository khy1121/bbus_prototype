import { BottomSheet } from '@/components'
import copyIcon from '../assets/copy.svg'
import shareFacebook from '../assets/share-facebook.webp'
import shareInstagram from '../assets/share-instagram.webp'
import shareKakao from '../assets/share-kakao.webp'
import shareX from '../assets/share-x.webp'
import type { DriveRecord } from '../types'
import { PolaroidCard } from './PolaroidCard'
import styles from './ShareRecordSheet.module.scss'

export type ShareChannel = 'kakao' | 'instagram' | 'x' | 'facebook'

const CHANNELS: { id: ShareChannel; label: string; icon: string }[] = [
  { id: 'kakao', label: '카카오톡', icon: shareKakao },
  { id: 'instagram', label: '인스타그램', icon: shareInstagram },
  { id: 'x', label: 'X', icon: shareX },
  { id: 'facebook', label: '페이스북', icon: shareFacebook },
]

type ShareRecordSheetProps = {
  open: boolean
  record: DriveRecord
  shareUrl: string
  onClose: () => void
  onShare: (channel: ShareChannel) => void
}

/** 드라이브 기록 카드 공유 바텀시트 (Figma 10:15449) */
export function ShareRecordSheet({ open, record, shareUrl, onClose, onShare }: ShareRecordSheetProps) {
  const copy = () => {
    // 디자인상 복사 완료 안내는 없음
    void navigator.clipboard?.writeText(shareUrl).catch(() => {})
  }

  return (
    <BottomSheet open={open} onClose={onClose} label="드라이브 기록 카드 공유하기" showClose>
      <div className={styles.content}>
        <div className={styles.summary}>
          <PolaroidCard record={record} size="sm" className={styles.thumb} />
          <div className={styles.summaryBody}>
            <div>
              <p className={styles.title}>드라이브 기록 카드</p>
              <p className={styles.description}>우리가 함께 달린 길을 공유해보세요.</p>
            </div>
            <div className={styles.link}>
              <span className={styles.url}>{shareUrl}</span>
              <button type="button" className={styles.copy} aria-label="링크 복사" onClick={copy}>
                <img src={copyIcon} alt="" aria-hidden />
              </button>
            </div>
          </div>
        </div>
        <div>
          <p className={styles.otherTitle}>다른 방법으로 공유하기</p>
          <ul className={styles.channels}>
            {CHANNELS.map((c) => (
              <li key={c.id}>
                <button type="button" className={styles.channel} onClick={() => onShare(c.id)}>
                  <img src={c.icon} alt="" aria-hidden />
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
