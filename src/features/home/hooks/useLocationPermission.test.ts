import { act, renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useLocationPermission } from './useLocationPermission'

function mockPermissions(state: PermissionState) {
  const status = { state, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  Object.defineProperty(navigator, 'permissions', {
    configurable: true,
    value: { query: vi.fn().mockResolvedValue(status) },
  })
  return status
}

describe('useLocationPermission', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'permissions', { configurable: true, value: undefined })
  })

  it('Permissions API 가 없으면 허용된 것으로 본다', () => {
    const { result } = renderHook(() => useLocationPermission())
    expect(result.current.granted).toBe(true)
  })

  it('거부 상태면 granted=false', async () => {
    mockPermissions('denied')
    const { result } = renderHook(() => useLocationPermission())
    await waitFor(() => expect(result.current.granted).toBe(false))
  })

  it('request() 가 위치를 받으면 granted=true 로 바뀐다', async () => {
    mockPermissions('denied')
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: (ok: PositionCallback) => ok({ coords: { latitude: 1, longitude: 2 } } as GeolocationPosition) },
    })
    const { result } = renderHook(() => useLocationPermission())
    await waitFor(() => expect(result.current.granted).toBe(false))
    await act(() => result.current.request())
    expect(result.current.granted).toBe(true)
  })
})
