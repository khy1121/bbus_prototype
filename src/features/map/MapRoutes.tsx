import { useRoutes } from 'react-router-dom'
import { relativeRoutes } from '@/lib/routes'
import { mapRoutes, mapTabRoutes } from './routes'

/**
 * 앱 라우터에서 지연 로딩되는 기록 지도
 * - tab: '/map/*' (하단 네비 탭) · 기본: '/map/cards/*' (카드 상세 등 전체 화면)
 */
export default function MapRoutes({ tab = false }: { tab?: boolean }) {
  return useRoutes(tab ? relativeRoutes(mapTabRoutes, '/map') : relativeRoutes(mapRoutes, '/map/cards'))
}
