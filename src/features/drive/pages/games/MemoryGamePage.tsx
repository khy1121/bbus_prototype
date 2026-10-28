import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Button } from '@/components'
import { getMemoryQuestions } from '../../api'
import { images } from '../../assets'
import { PLAYER_LABEL, type MemoryQuestion, type Player } from '../../types'
import { GameShell } from './GameShell'
import styles from './Games.module.scss'

/**
 * 15 추억 게임 (Figma 10:9722)
 * 정답 확인 없이 문제만 보여주고, 먼저 맞힌 사람을 고른다. '다음 문제' = 둘 다 못 맞혀 PASS 용도 포함.
 */
export function MemoryGamePage() {
  const [questions, setQuestions] = useState<MemoryQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [winner, setWinner] = useState<Player | null>(null)

  useEffect(() => {
    getMemoryQuestions().then(setQuestions)
  }, [])

  const q = questions[index]

  return (
    <GameShell
      title="추억 게임"
      primary={
        <Button
          size="lg"
          fullWidth
          onClick={() => {
            setIndex((i) => (i + 1) % questions.length)
            setWinner(null)
          }}
        >
          다음 문제
        </Button>
      }
    >
      {q && (
        <>
          <div className={styles.chalkboard}>
            <img src={images.chalkboard} alt="" aria-hidden />
            <h2 className={styles.chalkText}>{q.question}</h2>
          </div>
          <p className={styles.winnerQuestion}>누가 먼저 맞혔나요?</p>
          <div className={styles.winnerGrid}>
            {(['driver', 'passenger'] as const).map((p) => (
              <button
                key={p}
                type="button"
                className={clsx(styles.winner, winner === p && styles.winnerOn)}
                aria-pressed={winner === p}
                onClick={() => setWinner(p)}
              >
                <span>{PLAYER_LABEL[p]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </GameShell>
  )
}
