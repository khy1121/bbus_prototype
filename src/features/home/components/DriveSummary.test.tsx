import { render, screen } from '@testing-library/react'
import { DriveSummary } from './DriveSummary'

const summary = {
  duration: '약 1시간',
  mainRoute: '서해안\n고속도로',
  parking: '공영주차장\n이용 가능',
  visitTime: '오후 5-8시',
  visitTimeNote: '(일몰 시간대)',
}

describe('DriveSummary', () => {
  it('예상 소요 시간, 주요 경로, 주차 정보, 추천 방문 시간 4가지를 표시한다', () => {
    render(<DriveSummary summary={summary} locationGranted />)
    const list = screen.getByRole('list', { name: '드라이브 정보 요약' })
    expect(list.children).toHaveLength(4)
    expect(screen.getByText('예상 소요 시간')).toBeInTheDocument()
    expect(screen.getByText('약 1시간')).toBeInTheDocument()
    expect(screen.getByText('주요 경로')).toBeInTheDocument()
    expect(screen.getByText('주차 정보')).toBeInTheDocument()
    expect(screen.getByText('추천 방문 시간')).toBeInTheDocument()
    expect(screen.getByText('(일몰 시간대)')).toBeInTheDocument()
  })

  it('위치 권한이 없으면 예상 시간을 "- -" 로 표시한다', () => {
    render(<DriveSummary summary={summary} locationGranted={false} />)
    expect(screen.getByText('- -')).toBeInTheDocument()
    expect(screen.queryByText('약 1시간')).not.toBeInTheDocument()
  })
})
