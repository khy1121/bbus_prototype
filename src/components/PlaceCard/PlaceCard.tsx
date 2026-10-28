import clsx from 'clsx'
import { HashTag } from '../HashTag/HashTag'
import { Icon } from '../Icon/Icon'
import styles from './PlaceCard.module.scss'

export type PlaceSummary = {
  id: string
  name: string
  region: string
  duration: string
  thumbnail: string
  hashtags: string[]
}

type PlaceCardProps = {
  place: PlaceSummary
  onClick: (id: string) => void
  liked?: boolean
  onToggleLike?: (id: string) => void
  className?: string
}

/** 큐레이션 장소 카드 152×164 (Figma 10:7105) */
export function PlaceCard({ place, onClick, liked = false, onToggleLike, className }: PlaceCardProps) {
  return (
    <article className={clsx(styles.card, className)}>
      <button type="button" className={styles.main} onClick={() => onClick(place.id)}>
        <img className={styles.thumbnail} src={place.thumbnail} alt={place.name} loading="lazy" />
        <div className={styles.info}>
          <div>
            <h3 className={styles.name}>{place.name}</h3>
            <p className={styles.meta}>
              <Icon name="pin" />
              <span>{`${place.region} · ${place.duration}`}</span>
            </p>
          </div>
          <div className={styles.tags}>
            {place.hashtags.slice(0, 2).map((tag) => (
              <HashTag key={tag}>{tag}</HashTag>
            ))}
          </div>
        </div>
      </button>
      {onToggleLike && (
        <button
          type="button"
          className={styles.like}
          aria-label="찜하기"
          aria-pressed={liked}
          onClick={() => onToggleLike(place.id)}
        >
          <Icon name={liked ? 'heart-filled-card' : 'heart-card'} />
        </button>
      )}
    </article>
  )
}
