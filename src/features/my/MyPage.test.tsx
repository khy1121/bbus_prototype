import { screen } from '@testing-library/react'
import { renderWithRouter } from '@/test/utils'
import { MyPage } from './MyPage'

describe('MyPage', () => {
  it('앱 설치하기 버튼을 누르면 설치 방법 선택 시트가 열린다', async () => {
    const { user } = renderWithRouter(<MyPage />)
    expect(screen.getByRole('heading', { name: '마이' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /앱 설치하기/ }))
    expect(screen.getByRole('dialog', { name: '앱 설치하기' })).toBeInTheDocument()
  })
})
