import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { Modal } from './Modal'
import styles from './Modal.module.scss'

type ConfirmDialogProps = {
  open: boolean
  title: ReactNode
  description?: ReactNode
  illustration?: ReactNode
  /** 없으면 확인 버튼 하나만 노출 */
  cancelLabel?: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  /** X 버튼/배경 클릭 시 동작 (기본: onCancel) */
  onClose?: () => void
}

/** 취소/확인 2버튼 팝업. 취소 버튼은 고정폭(96px), 확인 버튼이 남은 폭을 채운다. */
export function ConfirmDialog({
  open,
  title,
  description,
  illustration,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose ?? onCancel}
      title={title}
      description={description}
      illustration={illustration}
      actions={
        <>
          {cancelLabel && (
            <Button variant="secondary" size="dialog" className={styles.cancel} onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button size="dialog" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}
