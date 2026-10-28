import clsx from 'clsx'
import arrow from '../assets/banner-arrow.svg'
import sunset from '../assets/sunset-banner.webp'
import styles from './RecommendBanner.module.scss'

/** 추천 코스 배너 (Figma 10:6435 ~ 10:6449) — 우선순위 후순위 */
export function RecommendBanner({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button type="button" className={clsx(styles.banner, className)} onClick={onClick}>
      <img className={styles.bg} src={sunset} alt="" />
      <span className={styles.content}>
        <span className={styles.top}>
          <span className={styles.eyebrow}>SPECIAL THEME</span>
          <img src={arrow} alt="" />
        </span>
        <span className={styles.title}>연인과 떠나는 노을 드라이브</span>
        <span className={styles.subtitle}>황금빛으로 물드는 드라이브 스팟 모음</span>
      </span>
    </button>
  )
}
