import { create } from 'zustand'

/** 크롬·삼성 인터넷·엣지가 보내는 설치 이벤트 (표준 타입에 없음) */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' | string }>
}

type PwaInstallState = {
  /** 잡아 둔 설치 프롬프트 — 있으면 버튼으로 바로 설치 창을 띄울 수 있다 */
  deferred: BeforeInstallPromptEvent | null
  installed: boolean
}

export const usePwaInstallStore = create<PwaInstallState>(() => ({ deferred: null, installed: false }))

/**
 * 앱 시작 시 한 번 호출. 브라우저 기본 설치 배너 대신, 마이 페이지 버튼에서 설치 창을 띄우도록 이벤트를 보관한다.
 * @returns 리스너 해제 함수
 */
export function initInstallPrompt(): () => void {
  const onPrompt = (e: Event) => {
    e.preventDefault()
    usePwaInstallStore.setState({ deferred: e as BeforeInstallPromptEvent })
  }
  const onInstalled = () => usePwaInstallStore.setState({ deferred: null, installed: true })
  window.addEventListener('beforeinstallprompt', onPrompt)
  window.addEventListener('appinstalled', onInstalled)
  return () => {
    window.removeEventListener('beforeinstallprompt', onPrompt)
    window.removeEventListener('appinstalled', onInstalled)
  }
}

export type InstallResult = 'accepted' | 'dismissed' | 'unavailable'

/** 설치 창 띄우기. 프롬프트가 없으면(미지원 브라우저·이미 설치됨) 'unavailable' */
export async function promptInstall(): Promise<InstallResult> {
  const { deferred } = usePwaInstallStore.getState()
  if (!deferred) return 'unavailable'
  // 프롬프트는 한 번만 쓸 수 있다
  usePwaInstallStore.setState({ deferred: null })
  await deferred.prompt()
  const { outcome } = await deferred.userChoice
  return outcome === 'accepted' ? 'accepted' : 'dismissed'
}

/** 이미 설치된 앱(홈 화면 아이콘)으로 실행 중인지 */
export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia?.('(display-mode: standalone)').matches === true
}

export type Platform = { os: 'ios' | 'android' | 'desktop'; inApp: 'kakaotalk' | null }

export function detectPlatform(
  userAgent: string = navigator.userAgent,
  maxTouchPoints: number = navigator.maxTouchPoints ?? 0,
): Platform {
  const inApp = /KAKAOTALK/i.test(userAgent) ? 'kakaotalk' : null
  // iPadOS 13+ 는 맥 UA 를 쓰므로 터치 지원 여부로 구분
  const ios = /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
  if (ios) return { os: 'ios', inApp }
  if (/Android/i.test(userAgent)) return { os: 'android', inApp }
  return { os: 'desktop', inApp }
}
