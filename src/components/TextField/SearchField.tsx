import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import searchIcon from '@/assets/icons/search.svg'
import styles from './TextField.module.scss'

type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  label: string
  onSearch: (value: string) => void
  onValueChange?: (value: string) => void
  /** 검색 버튼 오른쪽 추가 버튼 (기록지도 달력 등) */
  trailing?: ReactNode
  /** pill: 기록지도 검색창 · box: 라디오 사연 검색창 */
  variant?: 'pill' | 'box'
}

export function SearchField({
  label,
  onSearch,
  onValueChange,
  trailing,
  variant = 'pill',
  value,
  defaultValue,
  className,
  id,
  ...rest
}: SearchFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [inner, setInner] = useState(String(defaultValue ?? ''))
  const current = value !== undefined ? String(value) : inner

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(current.trim())
  }

  return (
    <form role="search" className={clsx(styles.search, styles[variant], className)} onSubmit={handleSubmit}>
      <label htmlFor={inputId} className={styles.hiddenLabel}>
        {label}
      </label>
      <input
        id={inputId}
        type="search"
        className={styles.searchInput}
        value={current}
        onChange={(e) => {
          setInner(e.target.value)
          onValueChange?.(e.target.value)
        }}
        {...rest}
      />
      <button type="submit" className={styles.searchButton} aria-label="검색">
        <img src={searchIcon} alt="" aria-hidden />
      </button>
      {trailing}
    </form>
  )
}
