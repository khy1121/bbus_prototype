import type { ReactNode } from 'react'
import clsx from 'clsx'
import { useOverlay } from '@/hooks/useOverlay'
import { IconButton } from '../IconButton/IconButton'
import { Portal } from '../Portal/Portal'
import styles from './BottomSheet.module.scss'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  /** dialog 접근성 이름 */
  label: string
  showClose?: boolean
  children: ReactNode
  className?: string
}

/** 모달형 바텀시트 — 공유하기 등 (Figma 10:6632) */
export function BottomSheet({ open, onClose, label, showClose = false, children, className }: BottomSheetProps) {
  useOverlay(open, onClose)
  if (!open) return null

  return (
    <Portal>
      <div className={styles.overlay} data-testid="sheet-overlay" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={clsx(styles.sheet, className)}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.handle} data-testid="sheet-handle" aria-hidden />
          {showClose && (
            <IconButton icon="close" label="닫기" variant="soft" className={styles.close} onClick={onClose} />
          )}
          {children}
        </div>
      </div>
    </Portal>
  )
}
