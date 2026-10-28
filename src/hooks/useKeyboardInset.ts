import { useEffect } from 'react'

/**
 * iOS 사파리/인앱 브라우저는 키보드가 올라와도 position: fixed 요소를 위로 밀어 올리지 않는다.
 * 보이는 영역(visualViewport)과 레이아웃 뷰포트의 차이를 --keyboard-inset 으로 노출해
 * 바텀시트·팝업이 키보드 위에 뜨도록 한다. (안드로이드 크롬은 대부분 0)
 */
export function useKeyboardInset() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const root = document.documentElement
    const update = () => {
      const covered = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
      root.style.setProperty('--keyboard-inset', `${covered}px`)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      root.style.removeProperty('--keyboard-inset')
    }
  }, [])
}
