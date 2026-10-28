import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { driveRoutes } from './routes'

/** '/drive' 하위 라우트를 실제 라우터로 렌더링 */
export function renderDrive(path = '/drive') {
  const router = createMemoryRouter(
    [
      { path: '/', element: <p>홈 화면</p> },
      { path: '/drive', children: driveRoutes },
    ],
    { initialEntries: [path] },
  )
  return { user: userEvent.setup(), router, ...render(<RouterProvider router={router} />) }
}
