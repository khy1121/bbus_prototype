import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { Modal } from './Modal'
import { ConfirmDialog } from './ConfirmDialog'

describe('Modal', () => {
  it('open=false 면 렌더링하지 않는다', () => {
    setup(
      <Modal open={false} onClose={() => {}} title="제목">
        내용
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('open 이면 제목으로 라벨링된 모달 dialog 를 렌더링한다', () => {
    setup(
      <Modal open onClose={() => {}} title="드라이브 코스 전송 완료!" description="함께 즐거운 시간 보내세요!">
        내용
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: '드라이브 코스 전송 완료!' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription('함께 즐거운 시간 보내세요!')
  })

  it('닫기 버튼, ESC, 배경 클릭으로 onClose 를 호출한다', async () => {
    const onClose = vi.fn()
    const { user } = setup(
      <Modal open onClose={onClose} title="제목">
        내용
      </Modal>,
    )
    await user.click(screen.getByRole('button', { name: '닫기' }))
    await user.keyboard('{Escape}')
    await user.click(screen.getByTestId('modal-overlay'))
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('dialog 내부 클릭은 닫지 않는다', async () => {
    const onClose = vi.fn()
    const { user } = setup(
      <Modal open onClose={onClose} title="제목">
        <p>내용</p>
      </Modal>,
    )
    await user.click(screen.getByText('내용'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('hideClose 면 닫기 버튼을 숨긴다', () => {
    setup(
      <Modal open onClose={() => {}} title="제목" hideClose>
        내용
      </Modal>,
    )
    expect(screen.queryByRole('button', { name: '닫기' })).not.toBeInTheDocument()
  })
})

describe('ConfirmDialog', () => {
  it('취소/확인 버튼을 렌더링하고 각각 콜백을 호출한다', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    const { user } = setup(
      <ConfirmDialog
        open
        title="카드를 삭제하시겠어요?"
        description="삭제한 드라이브 기록은 복구할 수 없어요."
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    )
    await user.click(screen.getByRole('button', { name: '취소' }))
    await user.click(screen.getByRole('button', { name: '삭제하기' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancelLabel 이 없으면 확인 버튼만 렌더링한다', () => {
    setup(<ConfirmDialog open title="완료" confirmLabel="닫기" onCancel={() => {}} onConfirm={() => {}} />)
    expect(screen.getAllByRole('button', { name: '닫기' })).toHaveLength(2) // X 닫기 + 확인 버튼
    expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument()
  })
})
