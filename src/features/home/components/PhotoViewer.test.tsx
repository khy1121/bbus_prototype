import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { PhotoViewer } from './PhotoViewer'

const photos = ['/1.jpg', '/2.jpg', '/3.jpg']

describe('PhotoViewer (사진 자세히 보기 — 디자인 추가)', () => {
  it('open 일 때 시작 index 의 사진과 카운터를 보여준다', () => {
    setup(<PhotoViewer open photos={photos} initialIndex={1} alt="오이도" onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: '오이도 사진 자세히 보기' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '오이도 사진 2' })).toHaveAttribute('src', '/2.jpg')
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('이전/다음 버튼과 방향키로 이동하고 끝에서 멈춘다', async () => {
    const { user } = setup(<PhotoViewer open photos={photos} initialIndex={0} alt="오이도" onClose={() => {}} />)
    expect(screen.getByRole('button', { name: '이전 사진' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '다음 사진' }))
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음 사진' })).toBeDisabled()
  })

  it('닫기 버튼/ESC 로 닫힌다', async () => {
    const onClose = vi.fn()
    const { user } = setup(<PhotoViewer open photos={photos} initialIndex={0} alt="오이도" onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: '닫기' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
