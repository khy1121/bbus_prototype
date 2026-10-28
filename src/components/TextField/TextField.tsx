import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from './TextField.module.scss'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  /** 접근성 라벨 (visuallyHidden 이면 화면에 숨김) */
  label: string
  hideLabel?: boolean
}

/** 드라이브명 입력 등 단일 라인 입력 (Figma 10:14305) */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hideLabel = true, className, id, type = 'text', ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={clsx(styles.field, className)}>
      <label htmlFor={inputId} className={clsx(hideLabel && styles.hiddenLabel)}>
        {label}
      </label>
      <input ref={ref} id={inputId} type={type} className={styles.input} {...rest} />
    </div>
  )
})
