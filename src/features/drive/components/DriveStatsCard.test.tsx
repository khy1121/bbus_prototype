import { render, screen } from '@testing-library/react'
import { DriveStatsCard } from './DriveStatsCard'

describe('DriveStatsCard', () => {
  it('도착지 설정 전에는 빈 값으로 표시한다', () => {
    render(<DriveStatsCard elapsedSec={null} distanceKm={null} arrival={null} />)
    expect(screen.getByText('주행 시간')).toBeInTheDocument()
    expect(screen.getByText('-분 -초')).toBeInTheDocument()
    expect(screen.getByText('-km')).toBeInTheDocument()
    expect(screen.getByText('-시 -분')).toBeInTheDocument()
  })

  it('주행 중 값을 표시한다', () => {
    render(<DriveStatsCard elapsedSec={32 * 60 + 18} distanceKm={24.6} arrival={new Date(2026, 9, 28, 19, 47)} />)
    expect(screen.getByText('32분 18초')).toBeInTheDocument()
    expect(screen.getByText('24.6km')).toBeInTheDocument()
    expect(screen.getByText('19시 47분')).toBeInTheDocument()
  })
})
