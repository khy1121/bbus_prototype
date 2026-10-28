import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { initInstallPrompt } from './lib/pwa/install'
import './styles/global.scss'

// 브라우저 설치 이벤트는 페이지 로드 직후에 오므로 렌더링 전에 수집한다 (마이 > 앱 설치하기에서 사용)
initInstallPrompt()
// 새 버전이 배포되면 새 서비스 워커가 바로 활성화되고 페이지를 새로고침해 반영한다
registerSW({ immediate: true })

// 안전장치: 배포 직후 예전 페이지가 이미 지워진 코드 조각(지연 로딩 청크)을 불러오다 실패하면 한 번만 새로고침
window.addEventListener('vite:preloadError', (event) => {
  const KEY = 'bbus:reloaded-after-deploy'
  try {
    if (sessionStorage.getItem(KEY)) return
    sessionStorage.setItem(KEY, '1')
  } catch {
    // 저장소를 못 쓰면 무한 새로고침 방지를 위해 그냥 둔다
    return
  }
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
