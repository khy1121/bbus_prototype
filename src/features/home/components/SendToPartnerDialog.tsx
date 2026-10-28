import { useEffect, useState } from 'react'
import { Button, ConfirmDialog, Modal } from '@/components'
import { SEND_CAR_CROP, sendCourseCar } from '../sprites'
import { SpriteImage } from './SpriteImage'
import styles from './SendToPartnerDialog.module.scss'

type SendToPartnerDialogProps = {
  open: boolean
  partnerName: string
  onClose: () => void
  /** 실제 전송 — 완료되면 전송 완료 안내로 바뀐다 */
  onSend: () => Promise<void>
}

/** 연인에게 보내기 확인 팝업 → 전송 완료 안내 (Figma 10:6683, 10:6786) */
export function SendToPartnerDialog({ open, partnerName, onClose, onSend }: SendToPartnerDialogProps) {
  const [step, setStep] = useState<'confirm' | 'sending' | 'done'>('confirm')

  useEffect(() => {
    if (open) setStep('confirm')
  }, [open])

  const handleSend = async () => {
    if (step !== 'confirm') return
    setStep('sending')
    try {
      await onSend()
      setStep('done')
    } catch {
      // TODO(backend): 전송 실패 안내 (디자인 없음)
      setStep('confirm')
    }
  }

  if (step === 'done') {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="드라이브 코스 전송 완료!"
        description={`${partnerName}님에게 드라이브 코스를 보냈어요.\n함께 즐거운 시간 보내세요!`}
        actions={
          <Button size="dialog" onClick={onClose}>
            닫기
          </Button>
        }
      />
    )
  }

  return (
    <ConfirmDialog
      open={open}
      illustration={<SpriteImage src={sendCourseCar} crop={SEND_CAR_CROP} />}
      title={
        <>
          {`${partnerName}님에게 이 `}
          <span className={styles.highlight}>드라이브 코스</span>
          {'를\n보내시겠어요?'}
        </>
      }
      description="연인에게 함께 가고 싶은 마음을 전달해 보세요."
      cancelLabel="취소"
      confirmLabel="보내기"
      onCancel={onClose}
      onConfirm={handleSend}
    />
  )
}
