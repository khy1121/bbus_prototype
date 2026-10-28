import { ConfirmDialog } from '@/components'

type LocationPermissionDialogProps = {
  open: boolean
  onClose: () => void
  /**
   * 웹에서는 OS 설정을 직접 열 수 없으므로 기본 동작은 권한 재요청.
   * TODO(native): 앱 래핑 시 OS 설정 화면 딥링크로 교체
   */
  onOpenSettings: () => void
}

/** 위치 권한 안내 팝업 (디자인 없음 → 기존 ConfirmDialog 패턴으로 추가) */
export function LocationPermissionDialog({ open, onClose, onOpenSettings }: LocationPermissionDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="위치 권한이 필요해요"
      description={'현재 위치를 기준으로 날씨와 교통,\n예상 소요 시간을 알려드려요.\n설정에서 위치 권한을 허용해 주세요.'}
      cancelLabel="나중에"
      confirmLabel="설정으로 이동"
      onCancel={onClose}
      onConfirm={onOpenSettings}
    />
  )
}

/** 브라우저 위치 권한 요청 (거부 시 false) */
export function requestLocation(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 8000 })
  })
}
