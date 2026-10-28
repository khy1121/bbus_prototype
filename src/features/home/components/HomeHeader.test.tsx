import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { HomeHeader } from './HomeHeader'

describe('HomeHeader', () => {
  it('오늘 날짜를 "YYYY년 M월 D일" 로 보여준다 (최신 디자인 10:15754)', () => {
    setup(<HomeHeader today={new Date(2026, 10, 3)} userName="민준" hasUnread={false} onBellClick={() => {}} />)
    const date = screen.getByText('2026년 11월 3일')
    expect(date.tagName).toBe('TIME')
    expect(date).toHaveAttribute('dateTime', '2026-11-03')
  })

  it('인사말을 사용자 이름과 함께 보여준다', () => {
    setup(<HomeHeader today={new Date(2026, 10, 3)} userName="민준" hasUnread={false} onBellClick={() => {}} />)
    expect(screen.getByText(/안녕하세요, 민준님!/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '오늘은 어디로 떠나볼까요?' })).toBeInTheDocument()
  })

  it('읽지 않은 알림이 있으면 빨간 점을 표시하고, 알림 버튼 클릭 시 콜백 호출', async () => {
    const onBellClick = vi.fn()
    const { user, rerender } = setup(
      <HomeHeader today={new Date(2026, 10, 3)} userName="민준" hasUnread onBellClick={onBellClick} />,
    )
    expect(screen.getByTestId('unread-dot')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '알림 (읽지 않은 알림 있음)' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /알림/ }))
    expect(onBellClick).toHaveBeenCalled()

    rerender(<HomeHeader today={new Date(2026, 10, 3)} userName="민준" hasUnread={false} onBellClick={onBellClick} />)
    expect(screen.queryByTestId('unread-dot')).not.toBeInTheDocument()
  })
})
