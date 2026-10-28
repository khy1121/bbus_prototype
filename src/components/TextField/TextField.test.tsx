import { screen } from '@testing-library/react'
import { useState } from 'react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { TextField } from './TextField'
import { TextArea } from './TextArea'
import { SearchField } from './SearchField'

describe('TextField', () => {
  it('label 로 접근 가능한 input 을 렌더링한다', () => {
    setup(<TextField label="드라이브명" placeholder="예시: 우리의 첫 바다 드라이브" />)
    expect(screen.getByRole('textbox', { name: '드라이브명' })).toHaveAttribute(
      'placeholder',
      '예시: 우리의 첫 바다 드라이브',
    )
  })

  it('입력값을 onChange 로 전달한다', async () => {
    const onChange = vi.fn()
    const { user } = setup(<TextField label="드라이브명" onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), '바다')
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('maxLength 를 적용한다', async () => {
    const { user } = setup(<TextField label="드라이브명" maxLength={3} />)
    await user.type(screen.getByRole('textbox'), '가나다라')
    expect(screen.getByRole('textbox')).toHaveValue('가나다')
  })
})

describe('TextArea', () => {
  function Controlled({ max = 300 }: { max?: number }) {
    const [v, setV] = useState('')
    return <TextArea label="사연" maxLength={max} value={v} onChange={(e) => setV(e.target.value)} />
  }

  it('글자 수 카운터를 "현재/최대" 로 표시한다', async () => {
    const { user } = setup(<Controlled />)
    expect(screen.getByText('0/300')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: '사연' }), '안녕')
    expect(screen.getByText('2/300')).toBeInTheDocument()
  })

  it('최대 글자 수를 넘겨 입력되지 않는다', async () => {
    const { user } = setup(<Controlled max={5} />)
    await user.type(screen.getByRole('textbox'), '123456789')
    expect(screen.getByRole('textbox')).toHaveValue('12345')
    expect(screen.getByText('5/5')).toBeInTheDocument()
  })
})

describe('SearchField', () => {
  it('searchbox 를 렌더링하고 Enter 시 onSearch(value) 를 호출한다', async () => {
    const onSearch = vi.fn()
    const { user } = setup(<SearchField label="장소 검색" onSearch={onSearch} />)
    const box = screen.getByRole('searchbox', { name: '장소 검색' })
    await user.type(box, '한강공원{Enter}')
    expect(onSearch).toHaveBeenCalledWith('한강공원')
  })

  it('검색 버튼 클릭 시에도 onSearch 를 호출한다', async () => {
    const onSearch = vi.fn()
    const { user } = setup(<SearchField label="장소 검색" onSearch={onSearch} defaultValue="바다" />)
    await user.click(screen.getByRole('button', { name: '검색' }))
    expect(onSearch).toHaveBeenCalledWith('바다')
  })

  it('trailing 슬롯을 렌더링한다 (예: 달력 버튼)', () => {
    setup(<SearchField label="기록 검색" onSearch={() => {}} trailing={<button type="button">달력</button>} />)
    expect(screen.getByRole('button', { name: '달력' })).toBeInTheDocument()
  })
})
