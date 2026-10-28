import { memo } from 'react'
import { Link } from 'react-router-dom'
import { icons, images } from '../assets'
import { usePlayerStore } from '../stores/playerStore'
import { useRadioStore } from '../stores/radioStore'
import { NowPlayingCard } from './NowPlayingCard'
import styles from './ContentPanel.module.scss'

const GAMES = [
  { to: '/drive/radio', title: '라디오', desc: '드라이브에 감성을 담는', image: images.gameRadio },
  { to: '/drive/games/balance', title: '밸런스 게임', desc: '둘 중 하나만 고른다면?', image: images.gameBalance },
  { to: '/drive/games/quiz', title: '넌센스 퀴즈', desc: '누가 더 많이 맞힐까?', image: images.gameQuiz },
  { to: '/drive/games/memory', title: '추억 게임', desc: '함께한 추억 돌아보기', image: images.gameMemory },
]

/** 하단 시트 '콘텐츠' 탭 — 함께 즐길 콘텐츠 (Figma 10:16223) */
export const ContentPanel = memo(function ContentPanel() {
  // 전체 재생/단일 재생을 시작한 뒤에는 DJ 카드가 재생 카드로 바뀐다
  const showPlayer = usePlayerStore((s) => s.started && Boolean(s.playlist?.tracks.length))
  const radioPlaying = useRadioStore((s) => s.isPlaying)

  return (
    <section className={styles.panel} aria-labelledby="drive-content-title">
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          둘만의 드라이브를 더욱 특별하게
          <img src={icons.musicNote} alt="" aria-hidden />
        </p>
        <h2 id="drive-content-title" className={styles.title}>
          함께 즐길 콘텐츠
        </h2>
      </div>

      {showPlayer ? (
        <NowPlayingCard />
      ) : (
        <Link to="/drive/dj" className={styles.djCard}>
          <span className={styles.djLabel}>DJ 플레이리스트</span>
          <span className={styles.djBody}>
            <span className={styles.djText}>
              둘의 취향에 맞는
              <br />
              플레이리스트를 만들러 가볼까요?
            </span>
            <span className={styles.djArrow} aria-hidden>
              <img src={icons.chevronCircle} alt="" />
            </span>
          </span>
        </Link>
      )}

      <ul className={styles.grid}>
        {GAMES.map((game) => {
          // 라디오 재생 중: 설명 대신 '재생 중' + 음파 아이콘, 카드는 재생 화면으로 (Figma 10:9369)
          const isLiveRadio = game.to === '/drive/radio' && radioPlaying
          return (
            <li key={game.to}>
              <Link to={isLiveRadio ? '/drive/radio/playing' : game.to} className={styles.gameCard}>
                <span className={styles.gameTexts}>
                  <span className={styles.gameTitle}>{game.title}</span>
                  {isLiveRadio ? (
                    <span className={styles.onAir}>
                      재생 중
                      <img src={icons.radioWave} alt="" aria-hidden />
                    </span>
                  ) : (
                    <span className={styles.gameDesc}>{game.desc}</span>
                  )}
                </span>
                <img className={styles.gameImage} src={game.image} alt="" aria-hidden />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
})
