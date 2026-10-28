import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('제목과 설명을 표시한다', () => {
    setup(<EmptyState title="검색 결과가 없어요" description="다른 검색어로 찾아보세요." />)
    expect(screen.getByText('검색 결과가 없어요')).toBeInTheDocument()
    expect(screen.getByText('다른 검색어로 찾아보세요.')).toBeInTheDocument()
  })

  it('action 이 있으면 버튼을 렌더링한다', async () => {
    const onClick = vi.fn()
    const { user } = setup(<EmptyState title="t" action={{ label: '다시 시도', onClick }} />)
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(onClick).toHaveBeenCalled()
  })
})
