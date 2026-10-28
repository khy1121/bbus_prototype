import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** 앱 프레임 안의 #overlay-root 로 렌더링 (없으면 body) — 데스크톱에서도 앱 영역 기준으로 뜬다 */
export function Portal({ children }: { children: ReactNode }) {
  const target = document.getElementById('overlay-root') ?? document.body
  return createPortal(children, target)
}
