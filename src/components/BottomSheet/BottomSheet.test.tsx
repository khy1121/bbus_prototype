import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { BottomSheet } from './BottomSheet'

describe('BottomSheet', () => {
  it('open 일 때만 dialog 를 렌더링한다', () => {
    const { rerender } = setup(
      <BottomSheet open={false} onClose={() => {}} label="공유하기">
        내용
      </BottomSheet>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    rerender(
      <BottomSheet open onClose={() => {}} label="공유하기">
        내용
      </BottomSheet>,
    )
    expect(screen.getByRole('dialog', { name: '공유하기' })).toBeInTheDocument()
  })

  it('배경 클릭/ESC/닫기 버튼으로 닫힌다', async () => {
    const onClose = vi.fn()
    const { user } = setup(
      <BottomSheet open onClose={onClose} label="공유하기" showClose>
        내용
      </BottomSheet>,
    )
    await user.click(screen.getByTestId('sheet-overlay'))
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('핸들을 렌더링한다', () => {
    setup(
      <BottomSheet open onClose={() => {}} label="공유하기">
        내용
      </BottomSheet>,
    )
    expect(screen.getByTestId('sheet-handle')).toBeInTheDocument()
  })
})
