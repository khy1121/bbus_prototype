import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { driveRoutes } from '@/features/drive/routes'
import { homeRoutes, homeTabRoutes } from '@/features/home/routes'
import { mapRoutes, mapTabRoutes } from '@/features/map/routes'
import { MyPage } from '@/features/my/MyPage'
import { AppLayout, TabLayout } from './layouts/AppLayout'
import { PlaceholderPage } from './PlaceholderPage'

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      // 하단 네비가 있는 탭 화면
      {
        element: <TabLayout />,
        children: [
          ...homeTabRoutes, // '/'
          ...mapTabRoutes, // '/map'
          { path: '/studio', element: <PlaceholderPage title="스튜디오" /> },
          { path: '/my', element: <MyPage /> },
        ],
      },
      // 전체 화면 (하단 네비 없음)
      ...homeRoutes, // '/notifications', '/places/:placeId'
      ...mapRoutes, // '/map/cards/:cardId' ...
      { path: '/drive', children: driveRoutes },
      { path: '*', element: <PlaceholderPage title="페이지를 찾을 수 없어요" /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
