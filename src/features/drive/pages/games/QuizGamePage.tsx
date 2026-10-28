import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Button } from '@/components'
import { getQuizQuestions } from '../../api'
import { images } from '../../assets'
import type { QuizQuestion } from '../../types'
import { GameShell } from './GameShell'
import styles from './Games.module.scss'

type Winner = 'driver' | 'passenger' | 'none'
const WINNERS: { value: Winner; label: string }[] = [
  { value: 'driver', label: '운전자' },
  { value: 'passenger', label: '동승자' },
  { value: 'none', label: '둘다 못 맞혔어요' },
]

/** 14 넌센스 퀴즈 (Figma 10:13675 → 10:13041) — 초성 힌트는 버튼을 눌렀을 때만 보여준다 */
export function QuizGamePage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [hintOpen, setHintOpen] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [winner, setWinner] = useState<Winner | null>(null)

  useEffect(() => {
    getQuizQuestions().then(setQuestions)
  }, [])

  const q = questions[index]
  const next = () => {
    setIndex((i) => (i + 1) % questions.length)
    setHintOpen(false)
    setRevealed(false)
    setWinner(null)
  }

  const letters = q ? [...(revealed ? q.answer : q.hint)] : []

  return (
    <GameShell
      title="넌센스 퀴즈"
      progress={q ? { current: index + 1, total: questions.length } : undefined}
      primary={
        revealed ? (
          <Button size="lg" fullWidth onClick={next}>
            다음 문제
          </Button>
        ) : (
          <Button size="lg" fullWidth leftIcon={<span aria-hidden>👁</span>} onClick={() => setRevealed(true)}>
            정답 보기
          </Button>
        )
      }
    >
      {q && (
        <>
          <h2 className={styles.quizQuestion}>{q.question}</h2>
          <div className={styles.answerBox}>
            <p className={clsx(styles.answerLabel, revealed && styles.answerLabelOn)}>
              <img src={revealed ? images.check : images.sparkle} alt="" aria-hidden />
              {revealed ? '정답' : '초성 힌트'}
            </p>
            {revealed || hintOpen ? (
              <div className={styles.letters}>
                {letters.map((ch, i) => (
                  <span key={i} className={clsx(styles.letter, revealed && styles.letterRevealed)}>
                    {ch}
                  </span>
                ))}
              </div>
            ) : (
              <>
                <div className={styles.letters}>
                  {[...q.hint].map((_, i) => (
                    <img key={i} className={styles.postit} src={images.postit} alt="" aria-hidden />
                  ))}
                </div>
                <button type="button" className={styles.hintButton} onClick={() => setHintOpen(true)}>
                  초성 힌트 보기
                </button>
              </>
            )}
          </div>

          {revealed && (
            <div className={styles.winners}>
              <p className={styles.winnerQuestion}>누가 먼저 맞혔나요?</p>
              <div className={styles.winnerGrid}>
                {WINNERS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    className={clsx(styles.winner, w.value === 'none' && styles.winnerWide, winner === w.value && styles.winnerOn)}
                    aria-pressed={winner === w.value}
                    onClick={() => setWinner(w.value)}
                  >
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </GameShell>
  )
}
