import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { SendToPartnerDialog } from './SendToPartnerDialog'

describe('SendToPartnerDialog', () => {
  it('확인 문구와 취소/보내기 버튼을 보여준다', () => {
    setup(<SendToPartnerDialog open partnerName="민지" onClose={() => {}} onSend={async () => {}} />)
    expect(screen.getByRole('dialog', { name: /민지님에게 이 드라이브 코스를\s*보내시겠어요\?/ })).toBeInTheDocument()
    expect(screen.getByText('연인에게 함께 가고 싶은 마음을 전달해 보세요.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '보내기' })).toBeInTheDocument()
  })

  it('취소는 보내지 않고 닫는다', async () => {
    const onClose = vi.fn()
    const onSend = vi.fn()
    const { user } = setup(<SendToPartnerDialog open partnerName="민지" onClose={onClose} onSend={onSend} />)
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(onClose).toHaveBeenCalled()
    expect(onSend).not.toHaveBeenCalled()
  })

  it('보내기 → 전송 완료 안내로 바뀌고, 닫기로 닫는다', async () => {
    const onClose = vi.fn()
    const onSend = vi.fn(async () => {})
    const { user } = setup(<SendToPartnerDialog open partnerName="민지" onClose={onClose} onSend={onSend} />)
    await user.click(screen.getByRole('button', { name: '보내기' }))
    expect(onSend).toHaveBeenCalled()
    expect(await screen.findByRole('dialog', { name: '드라이브 코스 전송 완료!' })).toBeInTheDocument()
    expect(screen.getByText(/민지님에게 드라이브 코스를 보냈어요/)).toBeInTheDocument()
    const closeButtons = screen.getAllByRole('button', { name: '닫기' })
    await user.click(closeButtons[closeButtons.length - 1])
    expect(onClose).toHaveBeenCalled()
  })
})
