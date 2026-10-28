import type { RouteObject } from 'react-router-dom'
import { DriveLayout } from './DriveLayout'
import { DrivePage } from './pages/DrivePage'
import { RoutePreviewPage } from './pages/RoutePreviewPage'
import { SearchPage } from './pages/SearchPage'
import { DjLoadingPage } from './pages/dj/DjLoadingPage'
import { DjPreferencePage } from './pages/dj/DjPreferencePage'
import { DjResultPage } from './pages/dj/DjResultPage'
import { BalanceGamePage } from './pages/games/BalanceGamePage'
import { MemoryGamePage } from './pages/games/MemoryGamePage'
import { QuizGamePage } from './pages/games/QuizGamePage'
import { RadioPage } from './pages/radio/RadioPage'
import { RadioPlayingPage } from './pages/radio/RadioPlayingPage'

/** '/drive' 하위 라우트 */
export const driveRoutes: RouteObject[] = [
  {
    element: <DriveLayout />,
    children: [
      { index: true, element: <DrivePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'route/:placeId', element: <RoutePreviewPage /> },
      { path: 'dj', element: <DjPreferencePage /> },
      { path: 'dj/loading', element: <DjLoadingPage /> },
      { path: 'dj/result', element: <DjResultPage /> },
      { path: 'radio', element: <RadioPage /> },
      { path: 'radio/playing', element: <RadioPlayingPage /> },
      { path: 'games/balance', element: <BalanceGamePage /> },
      { path: 'games/quiz', element: <QuizGamePage /> },
      { path: 'games/memory', element: <MemoryGamePage /> },
    ],
  },
]
