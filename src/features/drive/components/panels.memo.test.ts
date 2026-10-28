import { ContentPanel } from './ContentPanel'
import { StampPanel } from './StampPanel'

// 운행 중에는 경과 시간 때문에 드라이브 화면이 1초마다 다시 그려진다.
// 하단 시트 패널은 그와 무관하므로 memo 로 감싸 매초 다시 그리지 않게 한다.
const MEMO = Symbol.for('react.memo')

describe('하단 시트 패널 재렌더링 최적화', () => {
  it.each([
    ['ContentPanel', ContentPanel],
    ['StampPanel', StampPanel],
  ])('%s 는 memo 컴포넌트', (_, Component) => {
    expect((Component as unknown as { $$typeof: symbol }).$$typeof).toBe(MEMO)
  })
})
