import { useState } from 'react'
import { Button, Icon } from '@/components'
import { InstallAppSheet } from './InstallAppSheet'
import styles from './MyPage.module.scss'

/**
 * 마이 (UI 디자인 미완성 — 와이어프레임 단계)
 * 지금은 앱 설치하기만 제공. 프로필·약관·커플 연동·로그아웃 등은 디자인 확정 후 추가.
 */
export function MyPage() {
  const [installOpen, setInstallOpen] = useState(false)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>마이</h1>

      <section className={styles.card} aria-labelledby="install-title">
        <div className={styles.cardTexts}>
          <h2 id="install-title" className={styles.cardTitle}>
            붕붕어스를 앱으로 설치해 보세요
          </h2>
          <p className={styles.cardDesc}>홈 화면에서 바로 열고, 주소창 없이 넓은 화면으로 쓸 수 있어요.</p>
        </div>
        <Button size="lg" fullWidth leftIcon={<Icon name="car-button" />} onClick={() => setInstallOpen(true)}>
          앱 설치하기
        </Button>
      </section>

      <InstallAppSheet open={installOpen} onClose={() => setInstallOpen(false)} />
    </div>
  )
}
