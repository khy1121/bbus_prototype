import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { RecommendBanner } from './RecommendBanner'

describe('RecommendBanner', () => {
  it('추천 코스 문구를 보여주고 클릭 시 onClick', async () => {
    const onClick = vi.fn()
    const { user } = setup(<RecommendBanner onClick={onClick} />)
    expect(screen.getByText('SPECIAL THEME')).toBeInTheDocument()
    expect(screen.getByText('황금빛으로 물드는 드라이브 스팟 모음')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /연인과 떠나는 노을 드라이브/ }))
    expect(onClick).toHaveBeenCalled()
  })
})
