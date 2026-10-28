import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { ShareSheet } from './ShareSheet'

const place = {
  name: '시흥 오이도',
  region: '경기 시흥시',
  duration: '약 1시간',
  thumbnail: '/oido.jpg',
  shareUrl: 'https://bunbungus.app/places/oido',
}

describe('ShareSheet', () => {
  it('장소 요약, 링크, 공유 채널 4개를 보여준다', () => {
    setup(<ShareSheet open place={place} onClose={() => {}} onShare={() => {}} />)
    expect(screen.getByRole('dialog', { name: '공유하기' })).toBeInTheDocument()
    expect(screen.getByText('시흥 오이도')).toBeInTheDocument()
    expect(screen.getByText('경기 시흥시 · 약 1시간')).toBeInTheDocument()
    expect(screen.getByText('링크 공유하기')).toBeInTheDocument()
    expect(screen.getByText(place.shareUrl)).toBeInTheDocument()
    ;['카카오톡', '인스타그램', 'X', '페이스북'].forEach((name) =>
      expect(screen.getByRole('button', { name })).toBeInTheDocument(),
    )
  })

  it('복사 버튼을 누르면 링크를 클립보드에 복사한다', async () => {
    const { user } = setup(<ShareSheet open place={place} onClose={() => {}} onShare={() => {}} />)
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    await user.click(screen.getByRole('button', { name: '링크 복사' }))
    expect(writeText).toHaveBeenCalledWith(place.shareUrl)
  })

  it('공유 채널을 누르면 onShare(channel)', async () => {
    const onShare = vi.fn()
    const { user } = setup(<ShareSheet open place={place} onClose={() => {}} onShare={onShare} />)
    await user.click(screen.getByRole('button', { name: '카카오톡' }))
    expect(onShare).toHaveBeenCalledWith('kakao')
  })

  it('닫기 버튼으로 닫힌다', async () => {
    const onClose = vi.fn()
    const { user } = setup(<ShareSheet open place={place} onClose={onClose} onShare={() => {}} />)
    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(onClose).toHaveBeenCalled()
  })
})
