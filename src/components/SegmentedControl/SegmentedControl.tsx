import { useRef, type KeyboardEvent } from 'react'
import clsx from 'clsx'
import styles from './SegmentedControl.module.scss'

export type SegmentOption<V extends string> = { value: V; label: string }

type SegmentedControlProps<V extends string> = {
  /** tablist 접근성 이름 */
  label: string
  options: readonly SegmentOption<V>[]
  value: V
  onChange: (value: V) => void
  /**
   * tabs: 디바이더 배경 + 코랄2 선택 (드라이브 하단시트 콘텐츠/휴게소 스탬프)
   * toggle: 작은 pill 토글 + 코랄 선택 (기록지도 지도형/목록형)
   */
  variant?: 'tabs' | 'toggle'
  className?: string
}

export function SegmentedControl<V extends string>({
  label,
  options,
  value,
  onChange,
  variant = 'tabs',
  className,
}: SegmentedControlProps<V>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (index + delta + options.length) % options.length
    refs.current[next]?.focus()
    onChange(options[next].value)
  }

  return (
    <div role="tablist" aria-label={label} className={clsx(styles.root, styles[variant], className)}>
      {options.map((option, index) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={clsx(styles.tab, selected && styles.selected)}
            onClick={() => !selected && onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
