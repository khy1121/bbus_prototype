import { useEffect, useId, useRef, type ReactNode } from 'react'
import clsx from 'clsx'
import { IconButton, Portal } from '@/components'
import { useOverlay } from '@/hooks/useOverlay'
import styles from './DriveDialog.module.scss'

type DriveDialogProps = {
  open: boolean
  onClose: () => void
  /** dialog 접근성 이름 */
  label: string
  children: ReactNode
  className?: string
}

/**
 * 좌측 정렬 콘텐츠용 팝업 (휴게소 상세, 도장 찍기).
 * 공용 Modal 은 제목 가운데 정렬 고정이라 드라이브 모드 전용으로 둔다.
 */
export function DriveDialog({ open, onClose, label, children, className }: DriveDialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  useOverlay(open, onClose)
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])
  if (!open) return null
  return (
    <Portal>
      <div className={styles.overlay} onClick={onClose}>
        <div
          ref={ref}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          className={clsx(styles.dialog, className)}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton icon="close" label="닫기" variant="soft" className={styles.close} onClick={onClose} />
          {children}
        </div>
      </div>
    </Portal>
  )
}
