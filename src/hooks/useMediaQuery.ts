import { useSyncExternalStore } from 'react'
import { breakpoints } from '@/styles/tokens'

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** ≥1024px: 사이드바 + 2단 데스크톱 레이아웃 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.desktop}px)`)
}
