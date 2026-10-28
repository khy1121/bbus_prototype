import { Chip } from '@/components'
import { CATEGORIES } from '../mocks'
import { CATEGORY_ICONS, categorySprite } from '../sprites'
import type { CategoryId } from '../types'
import { SpriteImage } from './SpriteImage'

type CategoryChipsProps = {
  selected: CategoryId | null
  onSelect: (category: CategoryId) => void
  /** 칩 묶음의 접근성 이름 */
  label: string
  className?: string
}

/** 테마 카테고리 칩 줄 (바다·야경·근교 카페·자연·차박) — 홈 큐레이션, 드라이브 경로 검색에서 함께 쓴다 */
export function CategoryChips({ selected, onSelect, label, className }: CategoryChipsProps) {
  return (
    <div className={className} role="group" aria-label={label}>
      {CATEGORIES.map((c) => (
        <Chip
          key={c.id}
          selected={c.id === selected}
          icon={<SpriteImage src={categorySprite} crop={CATEGORY_ICONS[c.id]} />}
          onClick={() => onSelect(c.id)}
        >
          {c.label}
        </Chip>
      ))}
    </div>
  )
}
