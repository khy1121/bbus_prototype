import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip } from '@/components'
import { images } from '../../assets'
import { SubPage } from '../../components/SubPage'
import { usePlayerStore } from '../../stores/playerStore'
import type { PlaylistPreference } from '../../types'
import { toggleLimited } from '../../utils/format'
import { GENRES, MAX_GENRES, MAX_MOODS, MOODS, WEATHERS, type DjOption } from './djOptions'
import styles from './Dj.module.scss'

/** 07 DJ 플레이리스트 · 취향 선택 */
export function DjPreferencePage() {
  const navigate = useNavigate()
  const saved = usePlayerStore((s) => s.preference)
  const [moods, setMoods] = useState<string[]>(saved?.moods ?? [])
  const [weather, setWeather] = useState<string | null>(saved?.weather ?? null)
  const [genres, setGenres] = useState<string[]>(saved?.genres ?? [])
  const canSubmit = moods.length > 0 && weather !== null

  const renderChips = (options: DjOption[], isSelected: (l: string) => boolean, onToggle: (l: string) => void) => (
    <div className={styles.chips}>
      {options.map((o) => (
        <Chip key={o.label} variant="keyword" icon={o.emoji} selected={isSelected(o.label)} onClick={() => onToggle(o.label)}>
          {o.label}
        </Chip>
      ))}
    </div>
  )

  const handleSubmit = () => {
    const preference: PlaylistPreference = { moods, weather, genres }
    navigate('/drive/dj/loading', { state: { preference } })
  }

  return (
    <SubPage
      title="DJ 플레이리스트"
      onBack={() => navigate('/drive')}
      hero={<img src={images.djHero} alt="" aria-hidden />}
      footer={
        <>
          <p className={styles.hint}>예상 도착 시간에 맞춰 곡 수를 조절할게요!</p>
          <Button
            size="lg"
            fullWidth
            disabled={!canSubmit}
            onClick={handleSubmit}
            rightIcon={<img src={images.sparkle} alt="" aria-hidden className={styles.sparkle} />}
          >
            AI 플레이리스트 만들기
          </Button>
        </>
      }
    >
      <div className={styles.sections}>
        <section>
          <h2 className={styles.question}>
            <img src={images.num1} alt="" aria-hidden />
            오늘의 분위기는?
          </h2>
          {renderChips(MOODS, (l) => moods.includes(l), (l) => setMoods((m) => toggleLimited(m, l, MAX_MOODS)))}
        </section>
        <section>
          <h2 className={styles.question}>
            <img src={images.num2} alt="" aria-hidden />
            지금 날씨는 어떤가요?
          </h2>
          {renderChips(WEATHERS, (l) => weather === l, (l) => setWeather((w) => (w === l ? null : l)))}
        </section>
        <section>
          <h2 className={styles.question}>
            <img src={images.num3} alt="" aria-hidden />
            어떤 장르를 듣고 싶나요?
          </h2>
          {renderChips(GENRES, (l) => genres.includes(l), (l) => setGenres((g) => toggleLimited(g, l, MAX_GENRES)))}
        </section>
      </div>
    </SubPage>
  )
}
