import type { RouteObject } from 'react-router-dom'
import { CardDetailPage } from './pages/CardDetailPage'
import { RecordMapPage } from './pages/RecordMapPage'
import { StorySharePage } from './pages/StorySharePage'

/** 하단 네비가 붙는 기록 지도 탭 */
export const mapTabRoutes: RouteObject[] = [{ path: '/map', element: <RecordMapPage /> }]

/** 전체 화면: 카드 상세, 스토리 공유 */
export const mapRoutes: RouteObject[] = [
  { path: '/map/cards/:cardId', element: <CardDetailPage /> },
  { path: '/map/cards/:cardId/story', element: <StorySharePage /> },
]
