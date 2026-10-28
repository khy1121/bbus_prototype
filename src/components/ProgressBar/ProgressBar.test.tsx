import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('progressbar role 과 aria 값을 가진다', () => {
    render(<ProgressBar label="문제 진행률" value={3} max={10} />)
    const bar = screen.getByRole('progressbar', { name: '문제 진행률' })
    expect(bar).toHaveAttribute('aria-valuenow', '3')
    expect(bar).toHaveAttribute('aria-valuemax', '10')
  })

  it('비율만큼 채움 너비를 설정한다', () => {
    render(<ProgressBar label="p" value={1} max={4} />)
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '25%' })
  })

  it('범위를 벗어난 값은 0~100% 로 자른다', () => {
    render(<ProgressBar label="p" value={20} max={10} />)
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '100%' })
  })
})
