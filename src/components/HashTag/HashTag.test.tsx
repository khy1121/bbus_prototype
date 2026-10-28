import { render, screen } from '@testing-library/react'
import { HashTag } from './HashTag'

describe('HashTag', () => {
  it('# 접두사를 붙여 렌더링한다', () => {
    render(<HashTag>일몰</HashTag>)
    expect(screen.getByText('#일몰')).toBeInTheDocument()
  })

  it('이미 # 으로 시작하면 중복으로 붙이지 않는다', () => {
    render(<HashTag>#해안도로</HashTag>)
    expect(screen.getByText('#해안도로')).toBeInTheDocument()
  })

  it('size 를 클래스로 반영한다', () => {
    render(<HashTag size="md">드라이브코스</HashTag>)
    expect(screen.getByText('#드라이브코스').className).toMatch(/md/)
  })
})
