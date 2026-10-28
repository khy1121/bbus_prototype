import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { MOCK_REST_STOPS } from '../mocks'
import { RestStopModal } from './RestStopModal'

const stop = MOCK_REST_STOPS[0]

describe('RestStopModal (05 휴게소 상세)', () => {
  it('이름, 고속도로명, 소개, 대표 메뉴(최대 4개)를 보여준다', () => {
    setup(<RestStopModal restStop={stop} acquired={false} onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: '시흥하늘휴게소' })).toBeInTheDocument()
    expect(screen.getByText('수도권제1순환고속도로')).toBeInTheDocument()
    expect(screen.getByText('이 곳의 대표 메뉴')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('스탬프 획득 여부를 이미지 대체텍스트로 표시한다', () => {
    const { rerender } = setup(<RestStopModal restStop={stop} acquired={false} onClose={() => {}} />)
    expect(screen.getByRole('img', { name: '스탬프 미획득' })).toBeInTheDocument()
    rerender(<RestStopModal restStop={stop} acquired onClose={() => {}} />)
    expect(screen.getByRole('img', { name: '스탬프 획득' })).toBeInTheDocument()
  })

  it('닫기 버튼으로 닫는다', async () => {
    const onClose = vi.fn()
    const { user } = setup(<RestStopModal restStop={stop} acquired={false} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(onClose).toHaveBeenCalled()
  })
})
