import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { DriveBanner } from './DriveBanner'

const conditions = {
  weather: { label: '맑음', temperature: 22 },
  traffic: '원활' as const,
  theme: '바다 드라이브',
  carConnected: true,
}

describe('DriveBanner', () => {
  it('날씨/교통/추천 테마 칩 3개를 보여준다', () => {
    setup(<DriveBanner conditions={conditions} onStart={() => {}} />)
    expect(screen.getByText('맑음')).toBeInTheDocument()
    expect(screen.getByText('22°')).toBeInTheDocument()
    expect(screen.getByText('교통 상황')).toBeInTheDocument()
    expect(screen.getByText('원활')).toBeInTheDocument()
    expect(screen.getByText('추천 테마')).toBeInTheDocument()
    expect(screen.getByText('바다 드라이브')).toBeInTheDocument()
  })

  it('날씨·교통 정보를 못 불러오면 "- -" 로 표시한다', () => {
    setup(<DriveBanner conditions={{ ...conditions, weather: null, traffic: null }} onStart={() => {}} />)
    expect(screen.getAllByText('- -')).toHaveLength(2)
  })

  it('conditions 가 없으면(로딩/실패) 모두 "- -"', () => {
    setup(<DriveBanner conditions={null} onStart={() => {}} />)
    expect(screen.getAllByText('- -')).toHaveLength(3)
  })

  it('차량 연결 완료/실패를 표시한다', () => {
    const { rerender } = setup(<DriveBanner conditions={conditions} onStart={() => {}} />)
    expect(screen.getByText('차량 연결 완료')).toBeInTheDocument()
    rerender(<DriveBanner conditions={{ ...conditions, carConnected: false }} onStart={() => {}} />)
    expect(screen.getByText('차량 연결 실패')).toBeInTheDocument()
  })

  it('드라이브 시작하기 버튼 클릭 시 onStart', async () => {
    const onStart = vi.fn()
    const { user } = setup(<DriveBanner conditions={conditions} onStart={onStart} />)
    await user.click(screen.getByRole('button', { name: '드라이브 시작하기' }))
    expect(onStart).toHaveBeenCalled()
  })
})
