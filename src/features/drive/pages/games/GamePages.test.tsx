import { screen } from '@testing-library/react'
import { renderDrive } from '../../test-utils'

describe('밸런스 게임 (13)', () => {
  it('두 사람 모두 고르면 다음 문제 버튼이 활성화된다', async () => {
    const { user } = renderDrive('/drive/games/balance')
    expect(await screen.findByText('1 / 10')).toBeInTheDocument()
    const next = screen.getByRole('button', { name: '다음 문제' })
    expect(next).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '운전자 A 선택' }))
    expect(next).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '동승자 B 선택' }))
    expect(next).toBeEnabled()
    await user.click(next)
    expect(screen.getByText('2 / 10')).toBeInTheDocument()
  })

  it('마지막 문제 후 결과 화면', async () => {
    const { user } = renderDrive('/drive/games/balance')
    await screen.findByText('1 / 10')
    for (let i = 0; i < 10; i++) {
      await user.click(screen.getByRole('button', { name: '운전자 A 선택' }))
      await user.click(screen.getByRole('button', { name: '동승자 A 선택' }))
      await user.click(screen.getByRole('button', { name: i === 9 ? '결과 보기' : '다음 문제' }))
    }
    expect(screen.getByRole('heading', { name: '밸런스 게임 끝!' })).toBeInTheDocument()
    expect(screen.getByText(/10문제 중 10문제/)).toBeInTheDocument()
  })

  it('게임 중단하기 → 확인 팝업 → 그만하기 시 드라이브 화면', async () => {
    const { user, router } = renderDrive('/drive/games/balance')
    await screen.findByText('1 / 10')
    await user.click(screen.getByRole('button', { name: '게임 중단하기' }))
    expect(screen.getByRole('dialog', { name: '게임을 중단하시겠어요?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '계속하기' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '뒤로가기' }))
    await user.click(screen.getByRole('button', { name: '그만하기' }))
    expect(router.state.location.pathname).toBe('/drive')
  })
})

describe('넌센스 퀴즈 (14)', () => {
  it('초성 힌트 → 정답 보기 → 누가 맞혔는지 → 다음 문제', async () => {
    const { user } = renderDrive('/drive/games/quiz')
    expect(await screen.findByText('세상에서 가장 추운 바다는?')).toBeInTheDocument()
    expect(screen.queryByText('ㅆ')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '초성 힌트 보기' }))
    expect(screen.getByText('ㅆ')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '정답 보기' }))
    expect(screen.getByText('썰')).toBeInTheDocument()
    expect(screen.getByText('누가 먼저 맞혔나요?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '둘다 못 맞혔어요' }))
    expect(screen.getByRole('button', { name: '둘다 못 맞혔어요' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: '다음 문제' }))
    expect(screen.getByText('2 / 10')).toBeInTheDocument()
    expect(screen.queryByText('누가 먼저 맞혔나요?')).not.toBeInTheDocument()
  })
})

describe('추억 게임 (15)', () => {
  it('질문과 운전자/동승자 버튼, 다음 문제(PASS)', async () => {
    const { user } = renderDrive('/drive/games/memory')
    expect(await screen.findByText(/가장 먼저 기록한/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '운전자' }))
    expect(screen.getByRole('button', { name: '운전자' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: '다음 문제' }))
    expect(screen.getByText(/첫 데이트 장소/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '운전자' })).toHaveAttribute('aria-pressed', 'false')
  })
})
