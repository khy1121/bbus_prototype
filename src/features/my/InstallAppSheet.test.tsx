import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { usePwaInstallStore } from '@/lib/pwa/install'
import { setup } from '@/test/utils'
import { InstallAppSheet } from './InstallAppSheet'

function deferredPrompt(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const prompt = vi.fn(async () => {})
  usePwaInstallStore.setState({
    deferred: Object.assign(new Event('beforeinstallprompt'), { prompt, userChoice: Promise.resolve({ outcome }) }),
  })
  return prompt
}

const chrome = { os: 'android', inApp: null } as const

describe('InstallAppSheet (앱 설치하기)', () => {
  beforeEach(() => usePwaInstallStore.setState({ deferred: null, installed: false }))

  it('갤럭시 / 아이폰 / PC 설치 버튼 3개를 보여준다', () => {
    setup(<InstallAppSheet open onClose={() => {}} platform={chrome} />)
    expect(screen.getByRole('dialog', { name: '앱 설치하기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /갤럭시에서 설치하기/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /아이폰에서 설치하기/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /PC에서 설치하기/ })).toBeInTheDocument()
  })

  it('갤럭시: 설치 프롬프트가 있으면 바로 설치 창을 띄우고 완료 안내', async () => {
    const prompt = deferredPrompt('accepted')
    const { user } = setup(<InstallAppSheet open onClose={() => {}} platform={chrome} />)
    await user.click(screen.getByRole('button', { name: /갤럭시에서 설치하기/ }))
    expect(prompt).toHaveBeenCalled()
    expect(await screen.findByText('설치가 시작됐어요!')).toBeInTheDocument()
  })

  it('PC: 설치 프롬프트로 바로 설치', async () => {
    const prompt = deferredPrompt('accepted')
    const { user } = setup(<InstallAppSheet open onClose={() => {}} platform={{ os: 'desktop', inApp: null }} />)
    await user.click(screen.getByRole('button', { name: /PC에서 설치하기/ }))
    expect(prompt).toHaveBeenCalled()
  })

  it('갤럭시: 프롬프트가 없으면 브라우저 메뉴로 설치하는 방법을 안내', async () => {
    const { user } = setup(<InstallAppSheet open onClose={() => {}} platform={chrome} />)
    await user.click(screen.getByRole('button', { name: /갤럭시에서 설치하기/ }))
    expect(await screen.findByRole('heading', { name: '갤럭시에서 설치하기' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: '설치 순서' })).toHaveTextContent('[앱 설치]')
  })

  it('카카오톡 인앱 브라우저면 다른 브라우저로 열도록 먼저 안내', async () => {
    const { user } = setup(<InstallAppSheet open onClose={() => {}} platform={{ os: 'android', inApp: 'kakaotalk' }} />)
    await user.click(screen.getByRole('button', { name: /갤럭시에서 설치하기/ }))
    expect(await screen.findByText(/다른 브라우저로 열기/)).toBeInTheDocument()
  })

  it('아이폰: 사파리 공유 → 홈 화면에 추가 단계 안내', async () => {
    const { user } = setup(<InstallAppSheet open onClose={() => {}} platform={{ os: 'ios', inApp: null }} />)
    await user.click(screen.getByRole('button', { name: /아이폰에서 설치하기/ }))
    expect(screen.getByRole('heading', { name: '아이폰에서 설치하기' })).toBeInTheDocument()
    const steps = screen.getByRole('list', { name: '설치 순서' })
    expect(steps).toHaveTextContent('공유')
    expect(steps).toHaveTextContent('홈 화면에 추가')
  })

  it('안내 화면에서 뒤로 가면 선택 화면으로', async () => {
    const { user } = setup(<InstallAppSheet open onClose={() => {}} platform={chrome} />)
    await user.click(screen.getByRole('button', { name: /아이폰에서 설치하기/ }))
    await user.click(screen.getByRole('button', { name: '설치 방법 선택으로 돌아가기' }))
    expect(screen.getByRole('button', { name: /갤럭시에서 설치하기/ })).toBeInTheDocument()
  })

  it('이미 앱으로 실행 중이면 설치됨 안내', () => {
    setup(<InstallAppSheet open onClose={() => {}} platform={chrome} standalone />)
    expect(screen.getByText('이미 앱으로 설치되어 있어요')).toBeInTheDocument()
  })
})
