import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { LocationPermissionDialog } from './LocationPermissionDialog'

describe('LocationPermissionDialog', () => {
  it('위치 권한 안내 문구와 설정 이동 버튼을 보여준다', () => {
    setup(<LocationPermissionDialog open onClose={() => {}} onOpenSettings={() => {}} />)
    expect(screen.getByRole('dialog', { name: '위치 권한이 필요해요' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '설정으로 이동' })).toBeInTheDocument()
  })

  it('설정으로 이동/나중에 버튼이 각각 콜백을 호출한다', async () => {
    const onClose = vi.fn()
    const onOpenSettings = vi.fn()
    const { user } = setup(<LocationPermissionDialog open onClose={onClose} onOpenSettings={onOpenSettings} />)
    await user.click(screen.getByRole('button', { name: '설정으로 이동' }))
    await user.click(screen.getByRole('button', { name: '나중에' }))
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
