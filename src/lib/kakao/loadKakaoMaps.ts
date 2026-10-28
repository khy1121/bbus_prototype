const SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'

let loading: Promise<typeof kakao> | null = null

export function getKakaoMapKey(): string | undefined {
  const key = import.meta.env.VITE_KAKAO_MAP_KEY
  return key && key.trim() ? key.trim() : undefined
}

/** 카카오맵 SDK 를 한 번만 로드한다. 키가 없으면 reject. */
export function loadKakaoMaps(): Promise<typeof kakao> {
  if (window.kakao?.maps) return Promise.resolve(window.kakao)
  if (loading) return loading

  const key = getKakaoMapKey()
  if (!key) return Promise.reject(new Error('VITE_KAKAO_MAP_KEY 가 설정되지 않았습니다.'))

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${SDK_URL}?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`
    script.async = true
    script.onload = () => {
      if (!window.kakao) {
        reject(new Error('카카오맵 SDK 로드 실패'))
        return
      }
      window.kakao.maps.load(() => resolve(window.kakao!))
    }
    script.onerror = () => {
      loading = null
      reject(new Error('카카오맵 SDK 로드 실패'))
    }
    document.head.appendChild(script)
  })
  return loading
}
