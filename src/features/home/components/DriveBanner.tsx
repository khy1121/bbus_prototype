import clsx from 'clsx'
import { Button, Icon } from '@/components'
import bannerBg from '../assets/banner-bg.webp'
import dotGreen from '../assets/dot-green.svg'
import dotRed from '../assets/dot-red.svg'
import { INFO_ICONS, infoSprite } from '../sprites'
import type { DriveConditions, TrafficLevel } from '../types'
import { SpriteImage, type SpriteCrop } from './SpriteImage'
import styles from './DriveBanner.module.scss'

const EMPTY = '- -'

type DriveBannerProps = {
  /** null = 불러오는 중/실패 */
  conditions: DriveConditions | null
  onStart: () => void
  className?: string
}

const TRAFFIC_CLASS: Record<TrafficLevel, string> = {
  원활: styles.smooth,
  서행: styles.slow,
  정체: styles.jam,
}

function InfoChip({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: SpriteCrop
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <li className={styles.chip}>
      <SpriteImage src={infoSprite} crop={icon} />
      <span className={styles.chipTexts}>
        <span className={styles.chipLabel}>{label}</span>
        <span className={clsx(styles.chipValue, valueClassName)}>{value}</span>
      </span>
    </li>
  )
}

/** 상단 드라이브 준비 배너 (Figma 10:6332 ~ 10:6364) */
export function DriveBanner({ conditions, onStart, className }: DriveBannerProps) {
  const weather = conditions?.weather
  const traffic = conditions?.traffic
  const connected = conditions?.carConnected ?? false

  return (
    <section className={clsx(styles.banner, className)} aria-label="드라이브 준비">
      <img className={styles.bg} src={bannerBg} alt="" aria-hidden />
      <ul className={styles.chips}>
        <InfoChip
          icon={INFO_ICONS.weather}
          label={weather?.label ?? '날씨'}
          value={weather ? `${weather.temperature}°` : EMPTY}
        />
        <InfoChip
          icon={INFO_ICONS.traffic}
          label="교통 상황"
          value={traffic ?? EMPTY}
          valueClassName={traffic ? TRAFFIC_CLASS[traffic] : undefined}
        />
        <InfoChip icon={INFO_ICONS.theme} label="추천 테마" value={conditions?.theme ?? EMPTY} />
      </ul>
      <div className={styles.bottom}>
        <p className={styles.connection}>
          <img src={connected ? dotGreen : dotRed} alt="" />
          {connected ? '차량 연결 완료' : '차량 연결 실패'}
        </p>
        <Button size="pill" fullWidth leftIcon={<Icon name="car-button" />} onClick={onStart}>
          드라이브 시작하기
        </Button>
      </div>
    </section>
  )
}
