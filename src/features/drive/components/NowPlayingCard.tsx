import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlayerStore } from '../stores/playerStore'
import { PlayerControls } from './PlayerControls'
import styles from './NowPlayingCard.module.scss'

/** ⑮ 재생 카드 — DJ 카드 자리에 노출 (Figma 10:14235) */
export function NowPlayingCard() {
  const { playlist, currentIndex, isPlaying, togglePlay, next, prev } = usePlayerStore()
  const track = playlist?.tracks[currentIndex]
  const [elapsed, setElapsed] = useState(0)

  // TODO(backend): 음악 SDK 재생 위치로 교체 — 현재는 1초 단위로 진행만 시뮬레이션
  useEffect(() => setElapsed(0), [track?.id])
  useEffect(() => {
    if (!isPlaying || !track) return
    const timer = window.setInterval(() => setElapsed((e) => Math.min(e + 1, track.duration)), 1000)
    return () => window.clearInterval(timer)
  }, [isPlaying, track])

  if (!playlist || !track) return null
  const progress = (elapsed / track.duration) * 100

  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <img className={styles.album} src={track.albumArt} alt="" aria-hidden />
        <div className={styles.body}>
          <Link to="/drive/dj/result" className={styles.chip}>
            {playlist.title}
          </Link>
          <div className={styles.trackRow}>
            <div className={styles.texts}>
              <p className={styles.title}>{track.title}</p>
              <p className={styles.artist}>{track.artist}</p>
            </div>
            <PlayerControls isPlaying={isPlaying} onPrev={prev} onToggle={togglePlay} onNext={next} />
          </div>
        </div>
      </div>
      <div className={styles.progress} aria-hidden>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
