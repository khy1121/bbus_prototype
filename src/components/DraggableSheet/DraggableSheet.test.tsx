import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { DraggableSheet } from './DraggableSheet'
import { resolveSnap, type SnapPoint } from './resolveSnap'

const heights: Record<SnapPoint, number> = { collapsed: 100, half: 400, full: 700 }

describe('resolveSnap', () => {
  it('속도가 작으면 가장 가까운 스냅으로 이동한다', () => {
    expect(resolveSnap(380, 0, heights)).toBe('half')
    expect(resolveSnap(150, 0, heights)).toBe('collapsed')
    expect(resolveSnap(620, 0, heights)).toBe('full')
  })

  it('위로 빠르게 플릭하면 현재 높이보다 한 단계 위로 간다', () => {
    // velocity > 0 : 위로(높이 증가)
    expect(resolveSnap(420, 1.2, heights)).toBe('full')
    expect(resolveSnap(120, 1.2, heights)).toBe('half')
  })

  it('아래로 빠르게 플릭하면 한 단계 아래로 간다', () => {
    expect(resolveSnap(390, -1.2, heights)).toBe('collapsed')
    expect(resolveSnap(690, -1.2, heights)).toBe('half')
  })
})

describe('DraggableSheet', () => {
  it('현재 스냅을 data-snap 으로 노출한다', () => {
    setup(
      <DraggableSheet snap="half" onSnapChange={() => {}} heights={heights}>
        콘텐츠
      </DraggableSheet>,
    )
    expect(screen.getByTestId('draggable-sheet')).toHaveAttribute('data-snap', 'half')
  })

  it('핸들 버튼 클릭 시 다음 스냅으로 순환한다 (접근성 대체 동작)', async () => {
    const onSnapChange = vi.fn()
    const { user } = setup(
      <DraggableSheet snap="half" onSnapChange={onSnapChange} heights={heights}>
        콘텐츠
      </DraggableSheet>,
    )
    await user.click(screen.getByRole('button', { name: '시트 높이 조절' }))
    expect(onSnapChange).toHaveBeenCalledWith('full')
  })

  it('full 에서 핸들 클릭 시 collapsed 로 돌아간다', async () => {
    const onSnapChange = vi.fn()
    const { user } = setup(
      <DraggableSheet snap="full" onSnapChange={onSnapChange} heights={heights}>
        콘텐츠
      </DraggableSheet>,
    )
    await user.click(screen.getByRole('button', { name: '시트 높이 조절' }))
    expect(onSnapChange).toHaveBeenCalledWith('collapsed')
  })
})
