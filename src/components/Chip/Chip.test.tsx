import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { Chip } from './Chip'

describe('Chip', () => {
  it('선택 가능한 칩은 aria-pressed 로 상태를 노출한다', () => {
    setup(<Chip selected>바다</Chip>)
    expect(screen.getByRole('button', { name: '바다' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('클릭 시 onClick 을 호출한다', async () => {
    const onClick = vi.fn()
    const { user } = setup(<Chip onClick={onClick}>야경</Chip>)
    await user.click(screen.getByRole('button', { name: '야경' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('icon 을 라벨 앞에 렌더링한다', () => {
    setup(<Chip icon={<span data-testid="ic" />}>근교 카페</Chip>)
    expect(screen.getByTestId('ic')).toBeInTheDocument()
  })

  it('variant=category / keyword 에 따라 클래스가 달라진다', () => {
    setup(
      <>
        <Chip variant="category">바다</Chip>
        <Chip variant="keyword">신나는</Chip>
      </>,
    )
    expect(screen.getByRole('button', { name: '바다' }).className).toMatch(/category/)
    expect(screen.getByRole('button', { name: '신나는' }).className).toMatch(/keyword/)
  })

  it('selected 이면 selected 클래스를 가진다', () => {
    setup(<Chip selected>바다</Chip>)
    expect(screen.getByRole('button').className).toMatch(/selected/)
  })

  it('disabled 면 클릭되지 않는다', async () => {
    const onClick = vi.fn()
    const { user } = setup(
      <Chip disabled onClick={onClick}>
        재즈
      </Chip>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
