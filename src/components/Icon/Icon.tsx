import type { ImgHTMLAttributes } from 'react'
import { icons, type IconName } from './icons'

type IconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  name: IconName
  /** 의미 있는 아이콘이면 alt 를 넘긴다. 기본은 장식용(alt="") */
  alt?: string
}

/** SVG 원본 width/height 를 유지하는 아이콘 */
export function Icon({ name, alt = '', ...rest }: IconProps) {
  return <img src={icons[name]} alt={alt} aria-hidden={alt === '' ? true : undefined} draggable={false} {...rest} />
}
