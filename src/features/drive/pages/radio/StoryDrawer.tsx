import { useState } from 'react'
import { Portal } from '@/components'
import { useOverlay } from '@/hooks/useOverlay'
import { icons } from '../../assets'
import { useDriveDataStore } from '../../stores/driveDataStore'
import styles from './Radio.module.scss'

type StoryDrawerProps = {
  open: boolean
  onClose: () => void
  onSelect: (storyId: string) => void
  /** '사연 보내기' 항목 — 입력 화면으로 */
  onCompose: () => void
}

/** 보낸 사연 목록 — 오른쪽에서 열리는 서랍 (Figma 10:16888) */
export function StoryDrawer({ open, onClose, onSelect, onCompose }: StoryDrawerProps) {
  const stories = useDriveDataStore((s) => s.stories)
  const [query, setQuery] = useState('')
  useOverlay(open, onClose)
  if (!open) return null

  const filtered = query.trim() ? stories.filter((s) => s.text.includes(query.trim())) : stories

  return (
    <Portal>
      <div className={styles.drawerOverlay} onClick={onClose}>
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="보낸 사연 목록"
          className={styles.drawer}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.drawerHeader}>
            <h2 className={styles.drawerTitle}>보낸 사연 목록</h2>
            <button type="button" className={styles.menuButton} aria-label="목록 닫기" onClick={onClose}>
              <img src={icons.hamburger} alt="" aria-hidden />
            </button>
          </div>
          <div className={styles.drawerSearch}>
            <label htmlFor="story-search" className={styles.hidden}>
              사연 검색
            </label>
            <input
              id="story-search"
              type="search"
              placeholder="사연검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <img src={icons.searchDark} alt="" aria-hidden />
          </div>
          <ul className={styles.storyList}>
            <li>
              <button type="button" className={styles.storyItem} onClick={onCompose}>
                <img src={icons.sendArrow} alt="" aria-hidden />
                <span>사연 보내기</span>
              </button>
            </li>
            {filtered.map((story) => (
              <li key={story.id}>
                <button type="button" className={styles.storyItem} onClick={() => onSelect(story.id)}>
                  <img src={icons.story} alt="" aria-hidden />
                  <span className={styles.storyText}>
                    {query.trim()
                      ? story.text.split(query.trim()).flatMap((part, i, arr) =>
                          i < arr.length - 1 ? [part, <mark key={i}>{query.trim()}</mark>] : [part],
                        )
                      : story.text}
                  </span>
                  <img src={icons.chevronRight} alt="" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Portal>
  )
}
