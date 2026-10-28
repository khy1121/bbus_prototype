import { IconButton } from '@/components'
import { useOverlay } from '@/hooks/useOverlay'
import type { DriveRecord } from '../types'
import { PolaroidCard } from './PolaroidCard'
import styles from './PolaroidOverlay.module.scss'

type PolaroidOverlayProps = {
  record: DriveRecord
  onClose: () => void
  onOpen: (record: DriveRecord) => void
  onShare: (record: DriveRecord) => void
}

/** 마커 선택 시 지도 위 블러 + 폴라로이드 카드 (Figma 10:15138) */
export function PolaroidOverlay({ record, onClose, onOpen, onShare }: PolaroidOverlayProps) {
  useOverlay(true, onClose)
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={record.title} className={styles.body} onClick={(e) => e.stopPropagation()}>
        <IconButton icon="share" label="공유하기" className={styles.share} onClick={() => onShare(record)} />
        <PolaroidCard record={record} onClick={() => onOpen(record)} className={styles.card} />
        <p className={styles.hint}>카드를 눌러 자세한 기록을 확인해 보세요.</p>
      </div>
    </div>
  )
}
