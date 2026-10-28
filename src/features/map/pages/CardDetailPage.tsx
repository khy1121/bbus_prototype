import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog, EmptyState, IconButton } from '@/components'
import { deleteDriveRecord } from '../api'
import pinPlace from '../assets/pin-place.svg'
import trashIcon from '../assets/trash.svg'
import { PhotoCollage } from '../components/PhotoCollage'
import { PlaylistCard } from '../components/PlaylistCard'
import { RecordMessage } from '../components/RecordMessage'
import { RecordStats } from '../components/RecordStats'
import { useDriveRecord } from '../hooks'
import { formatKoreanDate } from '../utils/format'
import styles from './CardDetailPage.module.scss'

/** 드라이브 기록 카드 상세 (Figma 10:15492) */
export function CardDetailPage() {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const { record, loading } = useDriveRecord(cardId)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const goBack = () => navigate('/map')

  if (loading) return <div className={styles.page} aria-busy="true" />

  if (!record) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <IconButton icon="back" label="뒤로가기" onClick={goBack} />
        </header>
        <EmptyState title="기록을 찾을 수 없어요" description="삭제되었거나 존재하지 않는 기록이에요." />
      </div>
    )
  }

  const handleDelete = async () => {
    await deleteDriveRecord(record.id)
    setConfirmOpen(false)
    navigate('/map', { replace: true })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <IconButton icon="back" label="뒤로가기" onClick={goBack} />
        <h1 className={styles.date}>{formatKoreanDate(record.date)}</h1>
        {/* 디자인의 휴지통 버튼(10:15738) — 공용 IconButton 레지스트리에 없어 로컬 구현 */}
        <button type="button" className={styles.trash} aria-label="삭제" onClick={() => setConfirmOpen(true)}>
          <img src={trashIcon} alt="" aria-hidden />
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.summary}>
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>{record.title}</h2>
            <p className={styles.place}>
              <img src={pinPlace} alt="" aria-hidden />
              {record.place}
            </p>
          </div>
          <RecordStats record={record} />
          {record.playlist && (
            // TODO(drive): 드라이브 모드의 DJ 플레이리스트 화면과 연결 (현재는 동작 없음)
            <PlaylistCard playlist={record.playlist} onPlay={() => {}} />
          )}
        </div>

        <div className={styles.photos}>
          <PhotoCollage photos={record.photos} title={record.title} />
        </div>

        {(record.messages.driver || record.messages.passenger) && (
          <div className={styles.messages}>
            {record.messages.driver && <RecordMessage role="driver" message={record.messages.driver} />}
            {record.messages.passenger && <RecordMessage role="passenger" message={record.messages.passenger} />}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="카드를 삭제하시겠어요?"
        description="삭제한 드라이브 기록은 복구할 수 없어요."
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
