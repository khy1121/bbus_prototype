import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { Button } from './Button'

describe('Button', () => {
  it('라벨을 가진 button 을 렌더링한다 (기본 type=button)', () => {
    setup(<Button>보내기</Button>)
    const btn = screen.getByRole('button', { name: '보내기' })
    expect(btn).toHaveAttribute('type', 'button')
  })

  it('클릭 시 onClick 을 호출한다', async () => {
    const onClick = vi.fn()
    const { user } = setup(<Button onClick={onClick}>보내기</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 면 클릭되지 않는다', async () => {
    const onClick = vi.fn()
    const { user } = setup(
      <Button disabled onClick={onClick}>
        사연 보내기
      </Button>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('variant / size / fullWidth 를 클래스로 반영한다', () => {
    setup(
      <Button variant="secondary" size="md" fullWidth>
        취소
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/secondary/)
    expect(btn.className).toMatch(/md/)
    expect(btn.className).toMatch(/fullWidth/)
  })

  it('leftIcon 을 라벨 앞에 렌더링한다', () => {
    setup(<Button leftIcon={<span data-testid="icon" />}>드라이브 시작하기</Button>)
    const btn = screen.getByRole('button', { name: '드라이브 시작하기' })
    expect(btn.firstElementChild).toContainElement(screen.getByTestId('icon'))
  })
})
