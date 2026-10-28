import { lazy } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { HomePage } from '@/features/home/pages/HomePage'
import { AppLayout, TabLayout } from './layouts/AppLayout'
import { LazyBoundary } from './LazyBoundary'
import { PlaceholderPage } from './PlaceholderPage'

// 첫 화면(홈)만 기본 번들에 두고, 나머지 영역은 진입할 때 내려받는다 (code splitting)
const HomeSubRoutes = lazy(() => import('@/features/home/HomeSubRoutes'))
const MapRoutes = lazy(() => import('@/features/map/MapRoutes'))
const DriveRoutes = lazy(() => import('@/features/drive/DriveRoutes'))
const MyPage = lazy(() => import('@/features/my/MyPage').then((m) => ({ default: m.MyPage })))

const homeSub = (base: string) => ({
  path: `${base}/*`,
  element: (
    <LazyBoundary>
      <HomeSubRoutes base={base} />
    </LazyBoundary>
  ),
})

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      // 하단 네비가 있는 탭 화면
      {
        element: <TabLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          {
            path: '/map/*',
            element: (
              <LazyBoundary>
                <MapRoutes tab />
              </LazyBoundary>
            ),
          },
          { path: '/studio', element: <PlaceholderPage title="스튜디오" /> },
          {
            path: '/my',
            element: (
              <LazyBoundary>
                <MyPage />
              </LazyBoundary>
            ),
          },
        ],
      },
      // 전체 화면 (하단 네비 없음)
      homeSub('/notifications'),
      homeSub('/places'),
      homeSub('/couple'),
      {
        path: '/map/cards/*',
        element: (
          <LazyBoundary>
            <MapRoutes />
          </LazyBoundary>
        ),
      },
      {
        path: '/drive/*',
        element: (
          <LazyBoundary>
            <DriveRoutes />
          </LazyBoundary>
        ),
      },
      { path: '*', element: <PlaceholderPage title="페이지를 찾을 수 없어요" /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
