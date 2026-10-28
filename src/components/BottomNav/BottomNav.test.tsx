import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { renderWithRouter } from '@/test/utils'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('홈/기록 지도/드라이브/스튜디오/마이 5개 항목을 렌더링한다', () => {
    renderWithRouter(<BottomNav onDriveClick={() => {}} />)
    const nav = screen.getByRole('navigation', { name: '하단 메뉴' })
    expect(nav).toBeInTheDocument()
    ;['홈', '기록 지도', '스튜디오', '마이'].forEach((name) =>
      expect(screen.getByRole('link', { name })).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: '드라이브' })).toBeInTheDocument()
  })

  it('현재 경로의 탭에 aria-current="page" 를 준다', () => {
    renderWithRouter(<BottomNav onDriveClick={() => {}} />, { route: '/map' })
    expect(screen.getByRole('link', { name: '기록 지도' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '홈' })).not.toHaveAttribute('aria-current')
  })

  it('가운데 드라이브 버튼은 onDriveClick 을 호출한다', async () => {
    const onDriveClick = vi.fn()
    const { user } = renderWithRouter(<BottomNav onDriveClick={onDriveClick} />)
    await user.click(screen.getByRole('button', { name: '드라이브' }))
    expect(onDriveClick).toHaveBeenCalled()
  })
})
