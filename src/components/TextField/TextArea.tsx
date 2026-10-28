import { useId, type TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from './TextField.module.scss'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  maxLength: number
  value: string
}

/** 라디오 사연 입력 — 우측 하단 글자 수 카운터 (Figma 10:14256) */
export function TextArea({ label, maxLength, value, className, id, ...rest }: TextAreaProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={clsx(styles.areaField, className)}>
      <label htmlFor={inputId} className={styles.hiddenLabel}>
        {label}
      </label>
      <textarea id={inputId} className={styles.textarea} maxLength={maxLength} value={value} {...rest} />
      <span className={styles.counter} aria-live="polite">
        {value.length}/{maxLength}
      </span>
    </div>
  )
}
