import type { ReactNode } from 'react'
import clsx from 'clsx'
import { IconButton } from '@/components'
import styles from './SubPage.module.scss'

type SubPageProps = {
  title: string
  onBack: () => void
  right?: ReactNode
  /** 상단 일러스트 (DJ/라디오) — 있으면 아래 콘텐츠가 둥근 시트로 겹쳐 올라온다 */
  hero?: ReactNode
  /** hero 영역 배경 */
  heroTone?: 'plain' | 'radio'
  footer?: ReactNode
  children: ReactNode
  className?: string
}

/** 드라이브 서브 화면 공통 레이아웃: 상단(뒤로+제목) / 선택적 hero / 본문 / 하단 버튼 */
export function SubPage({ title, onBack, right, hero, heroTone = 'plain', footer, children, className }: SubPageProps) {
  return (
    <div className={clsx(styles.page, hero && styles[heroTone], className)}>
      <header className={styles.header}>
        <IconButton icon="back" label="뒤로가기" onClick={onBack} />
        <h1 className={styles.title}>{title}</h1>
        {right && <div className={styles.right}>{right}</div>}
      </header>
      {hero && <div className={styles.hero}>{hero}</div>}
      <main className={clsx(styles.body, hero && styles.sheet)}>{children}</main>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}
