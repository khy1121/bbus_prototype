import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { PlaceCard } from './PlaceCard'

const place = {
  id: 'oido',
  name: '시흥 오이도',
  region: '경기 시흥시',
  duration: '약 1시간',
  thumbnail: '/oido.jpg',
  hashtags: ['일몰', '해안도로'],
}

describe('PlaceCard', () => {
  it('사진, 장소명, 지역·소요시간, 해시태그를 표시한다', () => {
    setup(<PlaceCard place={place} onClick={() => {}} />)
    expect(screen.getByRole('img', { name: '시흥 오이도' })).toHaveAttribute('src', '/oido.jpg')
    expect(screen.getByText('시흥 오이도')).toBeInTheDocument()
    expect(screen.getByText('경기 시흥시 · 약 1시간')).toBeInTheDocument()
    expect(screen.getByText('#일몰')).toBeInTheDocument()
    expect(screen.getByText('#해안도로')).toBeInTheDocument()
  })

  it('카드를 누르면 onClick(place.id) 를 호출한다', async () => {
    const onClick = vi.fn()
    const { user } = setup(<PlaceCard place={place} onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: /시흥 오이도/ }))
    expect(onClick).toHaveBeenCalledWith('oido')
  })

  it('찜 버튼은 카드 클릭과 별개로 onToggleLike 를 호출한다', async () => {
    const onClick = vi.fn()
    const onToggleLike = vi.fn()
    const { user } = setup(<PlaceCard place={place} onClick={onClick} liked={false} onToggleLike={onToggleLike} />)
    await user.click(screen.getByRole('button', { name: '찜하기' }))
    expect(onToggleLike).toHaveBeenCalledWith('oido')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('liked 상태를 aria-pressed 로 표시한다', () => {
    setup(<PlaceCard place={place} onClick={() => {}} liked onToggleLike={() => {}} />)
    expect(screen.getByRole('button', { name: '찜하기' })).toHaveAttribute('aria-pressed', 'true')
  })
})
