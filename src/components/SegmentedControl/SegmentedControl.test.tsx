import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import { SegmentedControl } from './SegmentedControl'

const options = [
  { value: 'content', label: '콘텐츠' },
  { value: 'stamp', label: '휴게소 스탬프' },
] as const

describe('SegmentedControl', () => {
  it('tablist 와 tab 들을 렌더링하고 선택된 탭을 aria-selected 로 표시한다', () => {
    setup(<SegmentedControl label="드라이브 탭" options={options} value="content" onChange={() => {}} />)
    expect(screen.getByRole('tablist', { name: '드라이브 탭' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '콘텐츠' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '휴게소 스탬프' })).toHaveAttribute('aria-selected', 'false')
  })

  it('다른 탭을 누르면 onChange(value) 를 호출한다', async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <SegmentedControl label="드라이브 탭" options={options} value="content" onChange={onChange} />,
    )
    await user.click(screen.getByRole('tab', { name: '휴게소 스탬프' }))
    expect(onChange).toHaveBeenCalledWith('stamp')
  })

  it('방향키로 탭을 이동한다', async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <SegmentedControl label="드라이브 탭" options={options} value="content" onChange={onChange} />,
    )
    screen.getByRole('tab', { name: '콘텐츠' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith('stamp')
  })

  it('variant=toggle 이면 toggle 스타일 클래스를 가진다', () => {
    setup(
      <SegmentedControl
        label="보기 방식"
        variant="toggle"
        options={[
          { value: 'map', label: '지도형' },
          { value: 'list', label: '목록형' },
        ]}
        value="map"
        onChange={() => {}}
      />,
    )
    expect(screen.getByRole('tablist').className).toMatch(/toggle/)
  })
})
