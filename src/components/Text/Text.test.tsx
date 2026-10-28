import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text', () => {
  it('기본으로 span 에 body-m 타이포를 적용한다', () => {
    render(<Text>붕붕어스</Text>)
    const el = screen.getByText('붕붕어스')
    expect(el.tagName).toBe('SPAN')
    expect(el).toHaveClass('typo-body-m')
  })

  it('variant 와 as 로 태그와 타이포를 바꾼다', () => {
    render(
      <Text as="h1" variant="title-l-bold">
        제목
      </Text>,
    )
    const el = screen.getByRole('heading', { level: 1, name: '제목' })
    expect(el).toHaveClass('typo-title-l-bold')
  })

  it('color 토큰을 CSS 변수로 적용한다', () => {
    render(<Text color="coral-pressed">강조</Text>)
    expect(screen.getByText('강조')).toHaveStyle({ color: 'var(--color-coral-pressed)' })
  })

  it('className 과 기타 속성을 전달한다', () => {
    render(
      <Text className="extra" data-testid="t">
        a
      </Text>,
    )
    expect(screen.getByTestId('t')).toHaveClass('extra', 'typo-body-m')
  })
})
