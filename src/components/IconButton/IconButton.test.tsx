import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('aria-label 로 접근 가능한 이름을 가진다', () => {
    setup(<IconButton icon="back" label="뒤로가기" />)
    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument()
  })

  it('클릭 시 onClick 을 호출한다', async () => {
    const onClick = vi.fn()
    const { user } = setup(<IconButton icon="share" label="공유하기" onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: '공유하기' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('pressed 상태를 aria-pressed 로 노출한다 (토글형)', () => {
    setup(<IconButton icon="heart" activeIcon="heart-filled" label="찜하기" pressed />)
    expect(screen.getByRole('button', { name: '찜하기' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('pressed 이고 activeIcon 이 있으면 activeIcon 이미지를 쓴다', () => {
    const { container, rerender } = setup(
      <IconButton icon="heart" activeIcon="heart-filled" label="찜하기" pressed={false} />,
    )
    const before = container.querySelector('img')?.getAttribute('src')
    rerender(<IconButton icon="heart" activeIcon="heart-filled" label="찜하기" pressed />)
    const after = container.querySelector('img')?.getAttribute('src')
    expect(before).not.toBe(after)
  })

  it('variant 를 클래스로 반영한다', () => {
    setup(<IconButton icon="close" label="닫기" variant="soft" />)
    expect(screen.getByRole('button').className).toMatch(/soft/)
  })
})
