import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('제목을 heading 으로 렌더링한다', () => {
    setup(<TopBar title="알림" />)
    expect(screen.getByRole('heading', { name: '알림' })).toBeInTheDocument()
  })

  it('onBack 이 있으면 뒤로가기 버튼을 렌더링하고 호출한다', async () => {
    const onBack = vi.fn()
    const { user } = setup(<TopBar title="알림" onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(onBack).toHaveBeenCalled()
  })

  it('onBack 이 없으면 뒤로가기 버튼이 없다', () => {
    setup(<TopBar title="보낸 사연 목록" />)
    expect(screen.queryByRole('button', { name: '뒤로가기' })).not.toBeInTheDocument()
  })

  it('right 슬롯을 렌더링한다', () => {
    setup(<TopBar title="라디오" right={<button type="button">메뉴</button>} />)
    expect(screen.getByRole('button', { name: '메뉴' })).toBeInTheDocument()
  })
})
