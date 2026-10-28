import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Button, Modal } from '@/components'
import { generatePlaylist } from '../../api'
import { images } from '../../assets'
import { SubPage } from '../../components/SubPage'
import { usePlayerStore } from '../../stores/playerStore'
import type { PlaylistPreference } from '../../types'
import styles from './Dj.module.scss'

/** 단계별 문구: [진행 중, 완료] (Figma 10:9757) */
const STEPS: [string, string][] = [
  ['선택한 키워드 분석 중...', '선택한 키워드 분석 완료'],
  ['음악 서비스에서 곡 찾는 중...', '음악 서비스에서 곡 찾기 완료'],
  ['도착 시간에 맞춰 구성 중...', '도착 시간에 맞춰 구성 완료'],
]
const STEP_MS = 1200
/** 생성 제한 시간 — 넘으면 시간 초과 안내 */
export const DJ_GENERATE_TIMEOUT_MS = 30_000

type Failure = 'error' | 'timeout'

const FAILURE_COPY: Record<Failure, { title: string; description: string }> = {
  error: {
    title: '플레이리스트를 만들지 못했어요',
    description: '잠시 후 다시 시도해 주세요.',
  },
  timeout: {
    title: '생성 시간이 초과되었어요',
    description: '네트워크 상태를 확인한 뒤\n다시 만들어 주세요.',
  },
}

class TimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new TimeoutError()), ms)
    promise.then(
      (v) => {
        window.clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        window.clearTimeout(timer)
        reject(e)
      },
    )
  })
}

/** 08 DJ 플레이리스트 · 생성 중 — 앱을 나갔다 오면 초기화 (상태 미보존) */
export function DjLoadingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const preference = (location.state as { preference?: PlaylistPreference } | null)?.preference
  const setPlaylist = usePlayerStore((s) => s.setPlaylist)
  const [step, setStep] = useState(0)
  const [failure, setFailure] = useState<Failure | null>(null)

  useEffect(() => {
    if (!preference) {
      navigate('/drive/dj', { replace: true })
      return
    }
    let cancelled = false
    const timers = STEPS.map((_, i) => window.setTimeout(() => !cancelled && setStep(i + 1), STEP_MS * (i + 1)))
    Promise.all([
      withTimeout(generatePlaylist(preference), DJ_GENERATE_TIMEOUT_MS),
      new Promise((r) => window.setTimeout(r, STEP_MS * STEPS.length)),
    ])
      .then(([playlist]) => {
        if (cancelled) return
        setPlaylist(playlist, preference)
        navigate('/drive/dj/result', { replace: true })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        timers.forEach((t) => window.clearTimeout(t))
        setFailure(e instanceof TimeoutError ? 'timeout' : 'error')
      })
    return () => {
      cancelled = true
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [preference, navigate, setPlaylist])

  const cancel = () => navigate('/drive/dj', { replace: true })

  return (
    <SubPage
      title="DJ 플레이리스트"
      onBack={cancel}
      footer={
        <Button size="lg" fullWidth onClick={cancel}>
          생성 취소
        </Button>
      }
    >
      <div className={styles.loading}>
        {/* 진행 링 + 음파 (Figma 10:9743) */}
        <div className={styles.disc} aria-hidden>
          <img src={images.djLoadingDisc} alt="" />
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </div>
        <div className={styles.loadingTexts}>
          <p className={styles.loadingSub}>잠시만 기다려주세요..</p>
          <p className={styles.loadingTitle} role="status">
            우리에게 꼭 맞는 <em>맞춤 플레이리스트</em>가<br />
            만들어지고 있어요!
          </p>
        </div>
        <ol className={styles.steps}>
          {STEPS.map(([pending, done], i) => (
            <li key={pending} className={clsx(styles.step, i > step && styles.upcoming)}>
              <img
                className={clsx(styles.stepIcon, i === step && styles.spinning)}
                src={i < step ? images.djStepDone : images.djStepPending}
                alt=""
                aria-hidden
              />
              {i < step ? done : pending}
            </li>
          ))}
        </ol>
      </div>
      {failure && (
        <Modal
          open
          hideClose
          onClose={cancel}
          title={FAILURE_COPY[failure].title}
          description={FAILURE_COPY[failure].description}
          actions={
            <Button size="dialog" onClick={cancel}>
              닫기
            </Button>
          }
        />
      )}
    </SubPage>
  )
}
