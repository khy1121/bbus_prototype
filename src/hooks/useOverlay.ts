import { useEffect } from 'react'

let lockCount = 0

/** 오버레이가 열려 있는 동안 ESC 로 닫기 + body 스크롤 잠금 */
export function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    lockCount += 1
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      lockCount -= 1
      if (lockCount === 0) document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])
}
