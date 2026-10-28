import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from 'react'
import clsx from 'clsx'
import type { TypographyVariant } from '@/styles/tokens'

/** _tokens.scss $colors 의 키와 1:1 대응 */
export type TextColor =
  | 'coral'
  | 'coral-pressed'
  | 'coral-pressed2'
  | 'coral-2'
  | 'coral-3'
  | 'coral-stroke'
  | 'green'
  | 'red'
  | 'brown'
  | 'black'
  | 'gray-900'
  | 'gray-800'
  | 'gray-600'
  | 'gray-400'
  | 'gray-200'
  | 'white'

type TextProps<T extends ElementType> = {
  as?: T
  variant?: TypographyVariant
  color?: TextColor
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'color' | 'children'>

export function Text<T extends ElementType = 'span'>({
  as,
  variant = 'body-m',
  color,
  className,
  style,
  children,
  ...rest
}: TextProps<T>) {
  const Component: ElementType = as ?? 'span'
  const mergedStyle: CSSProperties | undefined = color
    ? { color: `var(--color-${color})`, ...(style as CSSProperties) }
    : (style as CSSProperties)

  return (
    <Component className={clsx(`typo-${variant}`, className)} style={mergedStyle} {...rest}>
      {children}
    </Component>
  )
}
