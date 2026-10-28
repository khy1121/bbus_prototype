import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { CurationSection } from './CurationSection'

const places = Array.from({ length: 7 }, (_, i) => ({
  id: `p${i}`,
  name: `장소${i}`,
  region: '경기',
  duration: '약 1시간',
  thumbnail: '/x.jpg',
  hashtags: ['바다'],
}))

const baseProps = {
  category: 'sea' as const,
  onCategoryChange: () => {},
  places,
  likedIds: [],
  onToggleLike: () => {},
  onPlaceClick: () => {},
  onRefresh: () => {},
}

describe('CurationSection', () => {
  it('제목과 안내 문구, 카테고리 칩 5개를 보여준다', () => {
    setup(<CurationSection {...baseProps} />)
    expect(screen.getByRole('heading', { name: '스마트 탐색 & 큐레이션' })).toBeInTheDocument()
    expect(screen.getByText('지금 기분에 맞는 드라이브를 찾아보세요.')).toBeInTheDocument()
    ;['바다', '야경', '근교 카페', '자연', '차박'].forEach((label) =>
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: '바다' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('칩을 누르면 onCategoryChange(id)', async () => {
    const onCategoryChange = vi.fn()
    const { user } = setup(<CurationSection {...baseProps} onCategoryChange={onCategoryChange} />)
    await user.click(screen.getByRole('button', { name: '야경' }))
    expect(onCategoryChange).toHaveBeenCalledWith('night')
  })

  it('장소 카드 7개와 끝에 새로고침 버튼을 보여준다', async () => {
    const onRefresh = vi.fn()
    const onPlaceClick = vi.fn()
    const { user } = setup(<CurationSection {...baseProps} onRefresh={onRefresh} onPlaceClick={onPlaceClick} />)
    expect(screen.getAllByRole('article')).toHaveLength(7)
    await user.click(screen.getByRole('button', { name: /다른 장소 추천받기/ }))
    expect(onRefresh).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /장소0/ }))
    expect(onPlaceClick).toHaveBeenCalledWith('p0')
  })

  it('찜한 장소는 찜 버튼이 눌린 상태', () => {
    setup(<CurationSection {...baseProps} likedIds={['p1']} />)
    const likes = screen.getAllByRole('button', { name: '찜하기' })
    expect(likes[1]).toHaveAttribute('aria-pressed', 'true')
    expect(likes[0]).toHaveAttribute('aria-pressed', 'false')
  })
})
