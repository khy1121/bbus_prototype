import type { RouteObject } from 'react-router-dom'
import { PlaceholderPage } from '@/app/PlaceholderPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { PlaceDetailPage } from './pages/PlaceDetailPage'

/** 전체 화면: 알림, 장소 상세 */
export const homeRoutes: RouteObject[] = [
  { path: '/notifications', element: <NotificationsPage /> },
  { path: '/places/:placeId', element: <PlaceDetailPage /> },
  // TODO(onboarding): 커플 코드 입력 및 초대 화면 — 연인 미연동 상태에서 '연인에게 보내기' 시 이동
  { path: '/couple/invite', element: <PlaceholderPage title="커플 코드 입력 및 초대" /> },
]
