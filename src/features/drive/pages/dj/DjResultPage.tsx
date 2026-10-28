import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Button } from '@/components'
import { icons } from '../../assets'
import { SubPage } from '../../components/SubPage'
import { usePlayerStore } from '../../stores/playerStore'
import type { Track } from '../../types'
import { formatPlaylistDuration, formatTrackTime } from '../../utils/format'
import { emojiOf } from './djOptions'
import styles from './Dj.module.scss'

const SWIPE_OPEN = 64
const ROW_HEIGHT = 67

/** 09 DJ 플레이리스트 · 생성 완료 (Figma 10:9772, 10:9950) */
export function DjResultPage() {
  const navigate = useNavigate()
  const { playlist, saved, toggleSaved, removeTrack, moveTrack, playAll, playSingle, currentIndex, isPlaying } =
    usePlayerStore()
  const [swiped, setSwiped] = useState<string | null>(null)

  if (!playlist) return <Navigate to="/drive/dj" replace />
  const total = playlist.tracks.reduce((s, t) => s + t.duration, 0)

  return (
    <SubPage
      title="DJ 플레이리스트"
      onBack={() => navigate('/drive')}
      footer={
        <div className={styles.resultActions}>
          <Button variant="secondary" size="lg" className={clsx(styles.remake, styles.squareButton)} onClick={() => navigate('/drive/dj')}>
            다시 만들기
          </Button>
          <Button
            size="lg"
            fullWidth
            className={styles.squareButton}
            onClick={() => {
              playAll()
              navigate('/drive')
            }}
          >
            전체 재생
          </Button>
        </div>
      }
    >
      <div className={styles.resultHead}>
        <div className={styles.resultTitleRow}>
          <h2 className={styles.resultTitle}>{playlist.title}</h2>
          <button type="button" className={styles.save} aria-label="플레이리스트 저장" aria-pressed={saved} onClick={toggleSaved}>
            <img src={saved ? icons.bookmarkFilled : icons.bookmark} alt="" aria-hidden />
          </button>
        </div>
        <p className={styles.resultMeta}>{`총 ${playlist.tracks.length}곡  ·  ${formatPlaylistDuration(total)}`}</p>
        <div className={styles.chips}>
          {playlist.keywords.map((k) => (
            <span key={k} className={styles.keywordTag}>
              <span aria-hidden>{emojiOf(k)}</span>
              {k}
            </span>
          ))}
        </div>
      </div>

      <ul className={styles.tracks} aria-label="곡 목록">
        {playlist.tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            count={playlist.tracks.length}
            playing={isPlaying && currentIndex === index}
            swiped={swiped === track.id}
            onSwipe={(open) => setSwiped(open ? track.id : null)}
            onPlay={() => playSingle(index)}
            onDelete={() => removeTrack(track.id)}
            onMove={(to) => moveTrack(index, to)}
          />
        ))}
      </ul>
    </SubPage>
  )
}

type TrackRowProps = {
  track: Track
  index: number
  count: number
  playing: boolean
  swiped: boolean
  onSwipe: (open: boolean) => void
  onPlay: () => void
  onDelete: () => void
  onMove: (to: number) => void
}

/** 곡 행 — 왼쪽으로 밀면 삭제, 오른쪽 핸들을 끌어 순서 변경 (키보드: ↑/↓) */
function TrackRow({ track, index, count, playing, swiped, onSwipe, onPlay, onDelete, onMove }: TrackRowProps) {
  const swipe = useRef<{ x: number; dx: number } | null>(null)
  const drag = useRef<{ y: number } | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

  const onRowPointerDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, dx: 0 }
  }
  const onRowPointerMove = (e: PointerEvent) => {
    if (swipe.current) swipe.current.dx = e.clientX - swipe.current.x
  }
  const onRowPointerUp = () => {
    const dx = swipe.current?.dx ?? 0
    swipe.current = null
    if (dx < -SWIPE_OPEN / 2) onSwipe(true)
    else if (dx > SWIPE_OPEN / 2) onSwipe(false)
  }

  const onHandlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { y: e.clientY }
  }
  const onHandlePointerMove = (e: PointerEvent) => {
    if (drag.current) setDragOffset(e.clientY - drag.current.y)
  }
  const onHandlePointerUp = () => {
    if (!drag.current) return
    const steps = Math.round(dragOffset / ROW_HEIGHT)
    drag.current = null
    setDragOffset(0)
    const to = Math.min(Math.max(index + steps, 0), count - 1)
    if (to !== index) onMove(to)
  }
  const onHandleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' && index < count - 1) {
      e.preventDefault()
      onMove(index + 1)
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault()
      onMove(index - 1)
    }
  }

  return (
    <li className={styles.trackItem}>
      <div
        className={clsx(styles.trackRow, swiped && styles.swiped, dragOffset !== 0 && styles.dragging)}
        style={dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined}
        onPointerDown={onRowPointerDown}
        onPointerMove={onRowPointerMove}
        onPointerUp={onRowPointerUp}
      >
        <span className={styles.trackNo}>{String(index + 1).padStart(2, '0')}</span>
        <button type="button" className={styles.trackMain} onClick={onPlay} aria-label={`${track.title} 재생`}>
          <img className={styles.album} src={track.albumArt} alt="" aria-hidden />
          <span className={styles.trackTexts}>
            <span className={clsx(styles.trackTitle, playing && styles.nowPlaying)}>{track.title}</span>
            <span className={styles.trackArtist}>{track.artist}</span>
          </span>
          <span className={styles.trackTime}>{formatTrackTime(track.duration)}</span>
        </button>
        <button
          type="button"
          className={styles.handle}
          aria-label={`${track.title} 순서 변경`}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onKeyDown={onHandleKeyDown}
        >
          <img src={icons.dragDotsA} alt="" aria-hidden />
          <img src={icons.dragDotsB} alt="" aria-hidden />
        </button>
      </div>
      <button
        type="button"
        className={styles.delete}
        aria-label={`${track.title} 삭제`}
        tabIndex={swiped ? 0 : -1}
        onClick={onDelete}
      >
        삭제
      </button>
    </li>
  )
}
