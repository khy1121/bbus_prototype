import { useRoutes } from 'react-router-dom'
import { relativeRoutes } from '@/lib/routes'
import { homeRoutes } from './routes'

/** 앱 라우터에서 지연 로딩되는 홈 하위 화면 (알림, 장소 상세 등) — '{base}/*' 에 붙는다 */
export default function HomeSubRoutes({ base }: { base: string }) {
  return useRoutes(relativeRoutes(homeRoutes, base))
}
