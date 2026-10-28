import { vi } from 'vitest'
import { detectPlatform, initInstallPrompt, promptInstall, usePwaInstallStore } from './install'

function fakePromptEvent(outcome: 'accepted' | 'dismissed') {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: string }>
  }
  event.prompt = vi.fn(async () => {})
  event.userChoice = Promise.resolve({ outcome })
  return event
}

describe('PWA 설치 프롬프트', () => {
  let dispose: () => void
  beforeEach(() => {
    usePwaInstallStore.setState({ deferred: null, installed: false })
    dispose = initInstallPrompt()
  })
  afterEach(() => dispose())

  it('beforeinstallprompt 를 잡아 두었다가(기본 배너는 막음) 버튼에서 띄운다', async () => {
    const event = fakePromptEvent('accepted')
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(usePwaInstallStore.getState().deferred).toBe(event)

    await expect(promptInstall()).resolves.toBe('accepted')
    expect(event.prompt).toHaveBeenCalled()
    // 한 번 쓴 프롬프트는 다시 못 쓴다
    expect(usePwaInstallStore.getState().deferred).toBeNull()
  })

  it('사용자가 취소하면 dismissed', async () => {
    window.dispatchEvent(fakePromptEvent('dismissed'))
    await expect(promptInstall()).resolves.toBe('dismissed')
  })

  it('잡아 둔 프롬프트가 없으면 unavailable (지원 안 하는 브라우저 · 이미 설치됨)', async () => {
    await expect(promptInstall()).resolves.toBe('unavailable')
  })

  it('설치가 끝나면(appinstalled) installed 로 표시', () => {
    window.dispatchEvent(new Event('appinstalled'))
    expect(usePwaInstallStore.getState().installed).toBe(true)
  })
})

describe('detectPlatform', () => {
  it.each([
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1', 0, { os: 'ios', inApp: null }],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 KAKAOTALK 10.8.0', 0, { os: 'ios', inApp: 'kakaotalk' }],
    ['Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36', 0, { os: 'android', inApp: null }],
    ['Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36 KAKAOTALK/10.8.0', 0, { os: 'android', inApp: 'kakaotalk' }],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36', 0, { os: 'desktop', inApp: null }],
    // iPadOS 는 데스크톱 UA 를 쓰지만 터치 지원으로 구분
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', 5, { os: 'ios', inApp: null }],
  ])('%s', (ua, touchPoints, expected) => {
    expect(detectPlatform(ua as string, touchPoints as number)).toEqual(expected)
  })
})
