import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '@/components'
import { getRecordShareUrl } from '../api'
import koreaMap from '../assets/korea-map.webp'
import storyAvatar from '../assets/story-avatar.webp'
import storyClose from '../assets/story-close.svg'
import storyFilters from '../assets/story-filters.svg'
import storyMusic from '../assets/story-music.svg'
import storyNext from '../assets/story-next.svg'
import storyOptions from '../assets/story-options.svg'
import storyPartnership from '../assets/story-partnership.svg'
import storyStar from '../assets/story-star.svg'
import storyStickers from '../assets/story-stickers.svg'
import storyText from '../assets/story-text.svg'
import { PolaroidCard } from '../components/PolaroidCard'
import { useDriveRecord } from '../hooks'
import styles from './StorySharePage.module.scss'

const EDIT_ACTIONS = [
  { label: '태그', icon: storyPartnership },
  { label: '텍스트', icon: storyText },
  { label: '스티커', icon: storyStickers },
  { label: '음악', icon: storyMusic },
  { label: '필터', icon: storyFilters },
  { label: '더보기', icon: storyOptions },
]

/**
 * 인스타그램 스토리 공유 미리보기 (Figma 10:15650).
 * 디자인은 인스타그램 편집 화면을 재현한 목업이라 편집 도구는 표시용이다.
 */
export function StorySharePage() {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const { record, loading } = useDriveRecord(cardId)

  const close = () => navigate(`/map/cards/${cardId}`)

  const shareToStory = () => {
    if (!record) return
    // TODO(instagram): 카드 이미지를 생성해 인스타그램 스토리 공유(앱 딥링크/Web Share Level 2 files)로 전달
    if (navigator.share) {
      void navigator.share({ title: record.title, url: getRecordShareUrl(record.id) }).catch(() => {})
    }
  }

  if (loading) return <div className={styles.page} aria-busy="true" />
  if (!record) return <EmptyState title="기록을 찾을 수 없어요" />

  return (
    <div className={styles.page}>
      <div className={styles.stage}>
        <img className={styles.background} src={koreaMap} alt="" aria-hidden />
        <div className={styles.scrim} aria-hidden />
        <div className={styles.editBar}>
          <button type="button" className={styles.round} aria-label="닫기" onClick={close}>
            <img src={storyClose} alt="" aria-hidden />
          </button>
          <div className={styles.editActions} aria-hidden>
            {EDIT_ACTIONS.map((a) => (
              <span key={a.label} className={styles.round}>
                <img src={a.icon} alt="" />
              </span>
            ))}
          </div>
        </div>
        <PolaroidCard record={record} className={styles.card} />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.targets}>
          <button type="button" className={styles.target} onClick={shareToStory}>
            <img className={styles.avatar} src={storyAvatar} alt="" aria-hidden />
            <span>내 스토리</span>
          </button>
          <button type="button" className={styles.target} onClick={shareToStory}>
            <img src={storyStar} alt="" aria-hidden />
            <span>친한 친구</span>
          </button>
        </div>
        <button type="button" className={styles.next} aria-label="공유하기" onClick={shareToStory}>
          <img src={storyNext} alt="" aria-hidden />
        </button>
      </div>
    </div>
  )
}
