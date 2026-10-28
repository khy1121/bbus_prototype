import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { PhotoSlider } from './PhotoSlider'

const photos = ['/1.jpg', '/2.jpg', '/3.jpg']

describe('PhotoSlider', () => {
  it('사진들과 현재/전체 장수를 표시한다', () => {
    setup(<PhotoSlider photos={photos} alt="시흥 오이도" onOpen={() => {}} />)
    expect(screen.getAllByRole('img', { name: /시흥 오이도 사진/ })).toHaveLength(3)
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('사진을 누르면 해당 index 로 onOpen 을 호출한다 (자세히 보기)', async () => {
    const onOpen = vi.fn()
    const { user } = setup(<PhotoSlider photos={photos} alt="시흥 오이도" onOpen={onOpen} />)
    await user.click(screen.getByRole('button', { name: '시흥 오이도 사진 2 크게 보기' }))
    expect(onOpen).toHaveBeenCalledWith(1)
  })

  it('방향키로 다음/이전 사진으로 이동한다', async () => {
    const { user } = setup(<PhotoSlider photos={photos} alt="시흥 오이도" onOpen={() => {}} />)
    screen.getByRole('region', { name: '시흥 오이도 사진' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })
})
