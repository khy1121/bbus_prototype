import { useEffect, useId, useRef, type ReactNode } from 'react'
import clsx from 'clsx'
import { useOverlay } from '@/hooks/useOverlay'
import { IconButton } from '../IconButton/IconButton'
import { Portal } from '../Portal/Portal'
import styles from './Modal.module.scss'

export type ModalProps = {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  /** 제목 위 일러스트 */
  illustration?: ReactNode
  /** 하단 버튼 영역 */
  actions?: ReactNode
  hideClose?: boolean
  children?: ReactNode
  className?: string
}

/** 화면 가운데 팝업 (Figma 10:6879 / 10:6775) */
export function Modal({
  open,
  onClose,
  title,
  description,
  illustration,
  actions,
  hideClose = false,
  children,
  className,
}: ModalProps) {
  const titleId = useId()
  const descId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  useOverlay(open, onClose)

  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <Portal>
      <div className={styles.overlay} data-testid="modal-overlay" onClick={onClose}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          className={clsx(styles.dialog, className)}
          onClick={(e) => e.stopPropagation()}
        >
          {!hideClose && (
            <IconButton icon="close" label="닫기" variant="soft" className={styles.close} onClick={onClose} />
          )}
          <div className={styles.body}>
            {illustration && <div className={styles.illustration}>{illustration}</div>}
            <div className={styles.texts}>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {description && (
                <p id={descId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {children}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      </div>
    </Portal>
  )
}
