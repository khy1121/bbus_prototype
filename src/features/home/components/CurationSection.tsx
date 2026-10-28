import { useEffect, useRef, useState } from 'react'
import { Chip, PlaceCard, type PlaceSummary } from '@/components'
import refreshIcon from '../assets/refresh.svg'
import { CATEGORIES } from '../mocks'
import { CATEGORY_ICONS, categorySprite } from '../sprites'
import type { CategoryId } from '../types'
import { SpriteImage } from './SpriteImage'
import styles from './CurationSection.module.scss'

type CurationSectionProps = {
  category: CategoryId
  onCategoryChange: (category: CategoryId) => void
  places: PlaceSummary[]
  likedIds: string[]
  onToggleLike: (placeId: string) => void
  onPlaceClick: (placeId: string) => void
  /** 스크롤 끝 새로고침 — 새로운 추천 장소 */
  onRefresh: () => void
  loading?: boolean
}

/** 스마트 탐색 & 큐레이션 (Figma 10:6329 ~ 10:6371) */
export function CurationSection({
  category,
  onCategoryChange,
  places,
  likedIds,
  onToggleLike,
  onPlaceClick,
  onRefresh,
  loading = false,
}: CurationSectionProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const [progress, setProgress] = useState(0)

  // 카테고리/목록이 바뀌면 처음으로
  useEffect(() => {
    listRef.current?.scrollTo({ left: 0 })
    setProgress(0)
  }, [category, places])

  const handleScroll = () => {
    const el = listRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setProgress(max > 0 ? el.scrollLeft / max : 0)
  }

  return (
    <section className={styles.section} aria-labelledby="curation-title">
      <div className={styles.heading}>
        <h2 id="curation-title" className={styles.title}>
          스마트 탐색 &amp; 큐레이션
        </h2>
        <p className={styles.description}>지금 기분에 맞는 드라이브를 찾아보세요.</p>
      </div>

      <div className={styles.chips} role="group" aria-label="카테고리">
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            selected={c.id === category}
            icon={<SpriteImage src={categorySprite} crop={CATEGORY_ICONS[c.id]} />}
            onClick={() => c.id !== category && onCategoryChange(c.id)}
          >
            {c.label}
          </Chip>
        ))}
      </div>

      <ul ref={listRef} className={styles.list} onScroll={handleScroll} aria-busy={loading}>
        {places.map((place) => (
          <li key={place.id}>
            <PlaceCard
              place={place}
              liked={likedIds.includes(place.id)}
              onToggleLike={onToggleLike}
              onClick={onPlaceClick}
            />
          </li>
        ))}
        <li>
          {/* 디자인 없음 → 추가: 스크롤 끝 새로고침 카드 */}
          <button
            type="button"
            className={styles.refresh}
            onClick={onRefresh}
            disabled={loading}
            aria-label="다른 장소 추천받기"
          >
            <span className={styles.refreshIcon}>
              <img src={refreshIcon} alt="" />
            </span>
            <span className={styles.refreshText}>
              다른 장소
              <br />
              추천받기
            </span>
          </button>
        </li>
      </ul>

      <div className={styles.progressTrack} aria-hidden>
        <div className={styles.progressThumb} style={{ left: `${progress * 42}%` }} />
      </div>
    </section>
  )
}
