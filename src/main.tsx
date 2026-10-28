import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { initInstallPrompt } from './lib/pwa/install'
import './styles/global.scss'

// 브라우저 설치 이벤트는 페이지 로드 직후에 오므로 렌더링 전에 수집한다 (마이 > 앱 설치하기에서 사용)
initInstallPrompt()
// 새 버전이 배포되면 다음 방문 때 자동 반영
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
