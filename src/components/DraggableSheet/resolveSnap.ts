export type SnapPoint = 'collapsed' | 'half' | 'full'
export const SNAP_ORDER: SnapPoint[] = ['collapsed', 'half', 'full']

/** px/ms — 이 이상이면 플릭으로 보고 방향대로 한 단계 이동 */
const FLICK_VELOCITY = 0.5

/**
 * 드래그가 끝난 시점의 시트 높이와 속도로 스냅 위치를 결정한다.
 * @param height 현재 시트 높이(px)
 * @param velocity 높이 변화 속도(px/ms). 양수 = 위로(커짐)
 */
export function resolveSnap(height: number, velocity: number, heights: Record<SnapPoint, number>): SnapPoint {
  if (Math.abs(velocity) >= FLICK_VELOCITY) {
    const direction = velocity > 0 ? 1 : -1
    // 현재 높이를 기준으로 진행 방향의 다음 스냅
    const candidates = SNAP_ORDER.filter((s) => (direction > 0 ? heights[s] > height : heights[s] < height))
    if (candidates.length) {
      return direction > 0 ? candidates[0] : candidates[candidates.length - 1]
    }
  }
  return SNAP_ORDER.reduce((closest, s) =>
    Math.abs(heights[s] - height) < Math.abs(heights[closest] - height) ? s : closest,
  )
}

export function nextSnap(current: SnapPoint): SnapPoint {
  return SNAP_ORDER[(SNAP_ORDER.indexOf(current) + 1) % SNAP_ORDER.length]
}
