import { ConfirmDialog } from '@/components'

type GameStopDialogProps = { open: boolean; onStop: () => void; onContinue: () => void }

/** 게임 중단 팝업 (Figma 10:13011) */
export function GameStopDialog({ open, onStop, onContinue }: GameStopDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="게임을 중단하시겠어요?"
      description={'게임을 중단하면 지금까지의 진행 상황은\n저장되지 않아요.'}
      cancelLabel="그만하기"
      confirmLabel="계속하기"
      onCancel={onStop}
      onConfirm={onContinue}
      onClose={onContinue}
    />
  )
}
