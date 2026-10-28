import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import { GameStopDialog } from '../../components/GameStopDialog'
import { SubPage } from '../../components/SubPage'
import styles from './Games.module.scss'

type GameShellProps = {
  title: string
  /** 진행 표시 (현재 문제 번호, 1부터) */
  progress?: { current: number; total: number }
  /** '다음 문제' 등 주 버튼 */
  primary?: ReactNode
  children: ReactNode
}

/** 게임 공통: 상단(뒤로) · 진행바 · 하단 [주 버튼 / 게임 중단하기] · 중단 확인 팝업 */
export function GameShell({ title, progress, primary, children }: GameShellProps) {
  const navigate = useNavigate()
  const [stopOpen, setStopOpen] = useState(false)
  const askStop = () => setStopOpen(true)

  return (
    <SubPage
      title={title}
      onBack={askStop}
      footer={
        <>
          {primary}
          <Button variant="secondary" size="lg" fullWidth onClick={askStop}>
            게임 중단하기
          </Button>
        </>
      }
    >
      {progress && (
        <div className={styles.progress}>
          <div
            className={styles.track}
            role="progressbar"
            aria-label="문제 진행률"
            aria-valuenow={progress.current}
            aria-valuemin={1}
            aria-valuemax={progress.total}
          >
            <div className={styles.fill} style={{ width: `${(progress.current / progress.total) * 100}%` }} />
          </div>
          <p className={styles.count}>{`${progress.current} / ${progress.total}`}</p>
        </div>
      )}
      {children}
      <GameStopDialog open={stopOpen} onStop={() => navigate('/drive')} onContinue={() => setStopOpen(false)} />
    </SubPage>
  )
}
