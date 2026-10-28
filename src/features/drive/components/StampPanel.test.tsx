import { screen } from '@testing-library/react'
import { setup } from '@/test/utils'
import { MOCK_REST_STOPS } from '../mocks'
import { useDriveDataStore } from '../stores/driveDataStore'
import { StampPanel } from './StampPanel'

describe('StampPanel (06 휴게소 스탬프)', () => {
  beforeEach(() => useDriveDataStore.getState().reset())

  it('안내 문구와 획득/전체 개수를 보여준다', () => {
    setup(<StampPanel restStops={MOCK_REST_STOPS} />)
    expect(screen.getByText('함께 모아가는 작은 드라이브의 기록')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '휴게소 스탬프' })).toBeInTheDocument()
    expect(screen.getByText('3 / 16')).toBeInTheDocument()
  })

  it('도장판은 처음부터 16칸 고정 — 휴게소 데이터 수와 무관하게 전체 개수는 16', () => {
    setup(<StampPanel restStops={MOCK_REST_STOPS.slice(0, 5)} />)
    expect(screen.getByText('3 / 16')).toBeInTheDocument()
    expect(screen.getAllByTestId('stamp-slot')).toHaveLength(16)
  })

  it('도장을 누르면 휴게소 상세 팝업이 열린다', async () => {
    const { user } = setup(<StampPanel restStops={MOCK_REST_STOPS} />)
    await user.click(screen.getByRole('button', { name: '시흥하늘휴게소 스탬프 (획득)' }))
    expect(screen.getByRole('dialog', { name: '시흥하늘휴게소' })).toBeInTheDocument()
  })

  it('도장 찍기 버튼 → GPS 로 휴게소 자동 입력 → 도장 찍기', async () => {
    const { user } = setup(<StampPanel restStops={MOCK_REST_STOPS} />)
    await user.click(screen.getByRole('button', { name: '도장 찍기' }))
    const dialog = screen.getByRole('dialog', { name: '휴게소 도장 찍기' })
    expect(dialog).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '현재 위치로 찾기' }))
    expect(await screen.findByRole('textbox', { name: '휴게소 이름' })).toHaveValue('시흥하늘휴게소')
  })

  it('직접 입력으로 휴게소를 골라 도장을 찍으면 개수가 늘어난다', async () => {
    const { user } = setup(<StampPanel restStops={MOCK_REST_STOPS} />)
    await user.click(screen.getByRole('button', { name: '도장 찍기' }))
    await user.type(screen.getByRole('textbox', { name: '휴게소 이름' }), '덕평')
    await user.click(screen.getByRole('option', { name: /덕평자연휴게소/ }))
    await user.click(screen.getByRole('button', { name: '도장 찍기 완료' }))
    expect(screen.getByText('4 / 16')).toBeInTheDocument()
  })
})
