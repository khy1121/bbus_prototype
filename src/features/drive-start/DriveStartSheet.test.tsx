import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { DriveStartSheet } from './DriveStartSheet'

describe('DriveStartSheet (드라이브명 입력 팝업)', () => {
  it('제목, 안내 문구, 입력창, 출발 버튼을 보여준다', () => {
    setup(<DriveStartSheet open carName="붕붕이" onClose={() => {}} onStart={() => {}} />)
    expect(screen.getByRole('dialog', { name: '드라이브 준비 완료!' })).toBeInTheDocument()
    expect(screen.getByText('오늘의 드라이브에 이름을 붙여주세요.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: '드라이브명' })).toHaveAttribute(
      'placeholder',
      '예시: 우리의 첫 바다 드라이브',
    )
    expect(screen.getByRole('button', { name: '붕붕! 붕붕이 출발' })).toBeEnabled()
  })

  it('입력한 이름으로 onStart 를 호출한다', async () => {
    const onStart = vi.fn()
    const { user } = setup(<DriveStartSheet open carName="붕붕이" onClose={() => {}} onStart={onStart} />)
    await user.type(screen.getByRole('textbox'), '우리의 첫 바다 드라이브')
    await user.click(screen.getByRole('button', { name: /출발/ }))
    expect(onStart).toHaveBeenCalledWith('우리의 첫 바다 드라이브')
  })

  it('입력은 필수가 아니다 — 비워둬도 출발할 수 있다', async () => {
    const onStart = vi.fn()
    const { user } = setup(<DriveStartSheet open carName="붕붕이" onClose={() => {}} onStart={onStart} />)
    await user.click(screen.getByRole('button', { name: /출발/ }))
    expect(onStart).toHaveBeenCalledWith('')
  })

  it('Enter 로도 출발한다', async () => {
    const onStart = vi.fn()
    const { user } = setup(<DriveStartSheet open carName="붕붕이" onClose={() => {}} onStart={onStart} />)
    await user.type(screen.getByRole('textbox'), '야경{Enter}')
    expect(onStart).toHaveBeenCalledWith('야경')
  })

  it('mode="rename" 이면 수정 문구와 기존 이름을 보여준다', async () => {
    const onStart = vi.fn()
    const { user } = setup(
      <DriveStartSheet open mode="rename" initialName="우리의 첫 바다 드라이브" onClose={() => {}} onStart={onStart} />,
    )
    expect(screen.getByRole('dialog', { name: '드라이브명 수정하기' })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('우리의 첫 바다 드라이브')
    await user.click(screen.getByRole('button', { name: '수정 완료' }))
    expect(onStart).toHaveBeenCalledWith('우리의 첫 바다 드라이브')
  })
})
