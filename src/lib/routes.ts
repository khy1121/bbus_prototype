import type { RouteObject } from 'react-router-dom'

type PathRoute = { path?: string } & Record<string, unknown>

/**
 * 절대 경로 라우트 목록 중 base 아래에 있는 것만 골라 base 기준 상대 경로로 바꾼다.
 * 지연 로딩되는 영역을 '{base}/*' 에 붙이고 그 안에서 useRoutes 로 렌더링할 때 쓴다.
 */
export function relativeRoutes<T extends PathRoute = RouteObject & PathRoute>(routes: T[], base: string): T[] {
  return routes.flatMap((route) => {
    const path = route.path ?? ''
    if (path === base) {
      const { path: _omit, ...rest } = route
      void _omit
      return [{ ...rest, index: true } as unknown as T]
    }
    if (path.startsWith(`${base}/`)) return [{ ...route, path: path.slice(base.length + 1) }]
    return []
  })
}
