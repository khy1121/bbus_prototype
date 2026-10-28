import clsx from 'clsx'
import styles from './SpriteImage.module.scss'

/** Figma 스프라이트 크롭 값 (이미지 크기/위치를 컨테이너 대비 % 로) */
export type SpriteCrop = {
  width: number
  height: number
  imgWidth: string
  imgHeight: string
  left: string
  top: string
}

type SpriteImageProps = {
  src: string
  crop: SpriteCrop
  alt?: string
  className?: string
}

/** 하나의 이미지 시트에서 일부분만 잘라 보여준다 (Figma 이미지 fill crop 재현) */
export function SpriteImage({ src, crop, alt = '', className }: SpriteImageProps) {
  return (
    <span
      className={clsx(styles.sprite, className)}
      style={{ width: crop.width, height: crop.height }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{ width: crop.imgWidth, height: crop.imgHeight, left: crop.left, top: crop.top }}
      />
    </span>
  )
}
