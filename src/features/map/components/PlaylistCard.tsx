import playlistButton from '../assets/playlist-button.svg'
import type { RecordPlaylist } from '../types'
import { formatPlaylistMeta } from '../utils/format'
import styles from './RecordDetail.module.scss'

type PlaylistCardProps = {
  playlist: RecordPlaylist
  onPlay: () => void
}

/** 함께 들었던 플레이리스트 카드 (Figma 10:15523) */
export function PlaylistCard({ playlist, onPlay }: PlaylistCardProps) {
  return (
    <section className={styles.playlist}>
      <img className={styles.cover} src={playlist.cover} alt="" />
      <div className={styles.playlistBody}>
        <span className={styles.playlistBadge}>함께 들었던 플레이리스트</span>
        <p className={styles.playlistTitle}>{playlist.title}</p>
        <p className={styles.playlistMeta}>{formatPlaylistMeta(playlist.trackCount, playlist.durationMin)}</p>
      </div>
      <button type="button" className={styles.playlistButton} aria-label="플레이리스트 보기" onClick={onPlay}>
        <img src={playlistButton} alt="" aria-hidden />
      </button>
    </section>
  )
}
