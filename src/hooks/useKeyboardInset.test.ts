import { act, renderHook } from '@testing-library/react'
import { useKeyboardInset } from './useKeyboardInset'

type Listener = () => void

function mockVisualViewport(height: number, offsetTop = 0) {
  const listeners: Record<string, Listener[]> = {}
  const vv = {
    height,
    offsetTop,
    addEventListener: (type: string, fn: Listener) => (listeners[type] ??= []).push(fn),
    removeEventListener: (type: string, fn: Listener) => {
      listeners[type] = (listeners[type] ?? []).filter((l) => l !== fn)
    },
    emit: (type: string) => (listeners[type] ?? []).forEach((l) => l()),
  }
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: vv })
  return vv
}

const inset = () => document.documentElement.style.getPropertyValue('--keyboard-inset')

describe('useKeyboardInset (iOS 키보드에 가려지는 하단 시트 보정)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 852 })
    document.documentElement.style.removeProperty('--keyboard-inset')
  })

  it('키보드가 없으면 0px', () => {
    mockVisualViewport(852)
    renderHook(() => useKeyboardInset())
    expect(inset()).toBe('0px')
  })

  it('키보드가 올라와 보이는 영역이 줄면 그만큼을 --keyboard-inset 으로 노출한다', () => {
    const vv = mockVisualViewport(852)
    renderHook(() => useKeyboardInset())
    act(() => {
      vv.height = 516
      vv.emit('resize')
    })
    expect(inset()).toBe('336px')
  })

  it('visualViewport 를 지원하지 않으면 아무것도 하지 않는다', () => {
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined })
    renderHook(() => useKeyboardInset())
    expect(inset()).toBe('')
  })
})
