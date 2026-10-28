import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Button } from '@/components'
import { getBalanceQuestions } from '../../api'
import { images } from '../../assets'
import { PLAYER_LABEL, type BalanceQuestion, type Player } from '../../types'
import { GameShell } from './GameShell'
import styles from './Games.module.scss'

type Choice = 'a' | 'b'
type Answers = Record<Player, Choice | null>
const EMPTY: Answers = { driver: null, passenger: null }
const AVATAR: Record<Player, string> = { driver: images.avatarDriver, passenger: images.avatarPassenger }

/**
 * 13 밸런스 게임 (Figma 10:9647)
 * 한 기기에서 운전자·동승자가 각각 A/B 를 고른다 (합의된 기본값). 두 사람 모두 골라야 다음 문제.
 */
export function BalanceGamePage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<BalanceQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>(EMPTY)
  const [matched, setMatched] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    getBalanceQuestions().then(setQuestions)
  }, [])

  const q = questions[index]
  const bothChosen = answers.driver !== null && answers.passenger !== null
  const isLast = index === questions.length - 1

  const handleNext = () => {
    const nextMatched = matched + (answers.driver === answers.passenger ? 1 : 0)
    setMatched(nextMatched)
    if (isLast) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setAnswers(EMPTY)
  }

  // 결과 화면 (디자인 없음 → 추가)
  if (finished) {
    return (
      <GameShell
        title="밸런스 게임"
        primary={
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              setIndex(0)
              setAnswers(EMPTY)
              setMatched(0)
              setFinished(false)
            }}
          >
            다시 하기
          </Button>
        }
      >
        <div className={styles.result}>
          <div className={styles.resultAvatars} aria-hidden>
            <img src={images.avatarDriver} alt="" />
            <img src={images.avatarPassenger} alt="" />
          </div>
          <h2 className={styles.resultTitle}>밸런스 게임 끝!</h2>
          <p className={styles.resultDesc}>
            {`${questions.length}문제 중 ${matched}문제에서\n같은 선택을 했어요`}
          </p>
          <button type="button" className={styles.resultLink} onClick={() => navigate('/drive')}>
            드라이브로 돌아가기
          </button>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="밸런스 게임"
      progress={q ? { current: index + 1, total: questions.length } : undefined}
      primary={
        <Button size="lg" fullWidth disabled={!bothChosen} onClick={handleNext}>
          {isLast ? '결과 보기' : '다음 문제'}
        </Button>
      }
    >
      {q && (
        <>
          <h2 className={styles.balanceQuestion}>{q.question}</h2>
          <div className={styles.options}>
            {(['a', 'b'] as const).map((key) => (
              <div key={key} className={styles.option}>
                <span className={styles.optionLetter}>{key.toUpperCase()}</span>
                <span className={styles.optionText}>{q[key]}</span>
              </div>
            ))}
          </div>
          <div className={styles.players}>
            {(['driver', 'passenger'] as const).map((player) => (
              <div key={player} className={styles.playerRow}>
                <span className={styles.player}>
                  <img src={AVATAR[player]} alt="" aria-hidden />
                  {PLAYER_LABEL[player]}
                </span>
                <div className={styles.picks}>
                  {(['a', 'b'] as const).map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      className={clsx(styles.pick, answers[player] === choice && styles.picked)}
                      aria-label={`${PLAYER_LABEL[player]} ${choice.toUpperCase()} 선택`}
                      aria-pressed={answers[player] === choice}
                      onClick={() => setAnswers((a) => ({ ...a, [player]: choice }))}
                    >
                      {choice.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className={styles.status} aria-live="polite">
            {bothChosen
              ? answers.driver === answers.passenger
                ? '두 사람의 선택이 같아요! 💕'
                : '서로 다른 선택을 했어요!'
              : `${[answers.driver ? null : '운전자', answers.passenger ? null : '동승자'].filter(Boolean).join(', ')}의 선택을 기다리고 있어요`}
          </p>
        </>
      )}
    </GameShell>
  )
}
