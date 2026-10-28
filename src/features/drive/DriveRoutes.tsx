import { useRoutes } from 'react-router-dom'
import { driveRoutes } from './routes'

/** 앱 라우터에서 지연 로딩되는 드라이브 모드 전체 ('/drive/*') */
export default function DriveRoutes() {
  return useRoutes(driveRoutes)
}
