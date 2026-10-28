import { useCallback, useEffect, useState } from 'react'
import { requestLocation } from '@/features/permissions/LocationPermissionDialog'

/**
 * 브라우저 위치 권한 상태.
 * Permissions API 가 없거나 'prompt' 면 허용된 것으로 보고, 명시적으로 'denied' 일 때만 false.
 */
export function useLocationPermission() {
  const [granted, setGranted] = useState(true)

  useEffect(() => {
    let status: PermissionStatus | null = null
    let cancelled = false
    const onChange = () => status && setGranted(status.state !== 'denied')

    navigator.permissions
      ?.query({ name: 'geolocation' as PermissionName })
      .then((s) => {
        if (cancelled) return
        status = s
        setGranted(s.state !== 'denied')
        s.addEventListener('change', onChange)
      })
      .catch(() => {})

    return () => {
      cancelled = true
      status?.removeEventListener('change', onChange)
    }
  }, [])

  /** 권한 재요청 (웹에서는 OS 설정을 열 수 없으므로 위치 요청으로 대체) */
  const request = useCallback(async () => {
    const position = await requestLocation()
    if (position) setGranted(true)
    return Boolean(position)
  }, [])

  return { granted, request }
}
