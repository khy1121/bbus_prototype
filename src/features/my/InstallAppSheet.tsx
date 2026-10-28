import { useState } from 'react'
import { BottomSheet, Button, IconButton } from '@/components'
import { detectPlatform, isStandalone, promptInstall, type Platform } from '@/lib/pwa/install'
import styles from './InstallAppSheet.module.scss'

type Target = 'galaxy' | 'iphone' | 'pc'
type View = { kind: 'choose' } | { kind: 'done' } | { kind: 'guide'; target: Target }

const TARGETS: { id: Target; label: string; description: string; emoji: string }[] = [
  { id: 'galaxy', label: '갤럭시에서 설치하기', description: '크롬 · 삼성 인터넷', emoji: '📱' },
  { id: 'iphone', label: '아이폰에서 설치하기', description: '사파리에서 홈 화면에 추가', emoji: '🍎' },
  { id: 'pc', label: 'PC에서 설치하기', description: '크롬 · 엣지', emoji: '💻' },
]

type InstallAppSheetProps = {
  open: boolean
  onClose: () => void
  /** 테스트·미리보기용 주입. 기본은 현재 브라우저 */
  platform?: Platform
  standalone?: boolean
}

/**
 * 앱 설치하기 (디자인 없음 → 바텀시트 패턴으로 추가)
 * - 갤럭시/PC: 브라우저 설치 프롬프트로 바로 설치, 없으면 메뉴로 설치하는 방법 안내
 * - 아이폰: iOS 는 설치 API 가 없어 '홈 화면에 추가' 방법 안내
 */
export function InstallAppSheet({
  open,
  onClose,
  platform = detectPlatform(),
  standalone = isStandalone(),
}: InstallAppSheetProps) {
  const [view, setView] = useState<View>({ kind: 'choose' })

  const close = () => {
    setView({ kind: 'choose' })
    onClose()
  }

  const handleSelect = async (target: Target) => {
    if (target === 'iphone') {
      setView({ kind: 'guide', target })
      return
    }
    const result = await promptInstall()
    if (result === 'accepted') setView({ kind: 'done' })
    else if (result === 'unavailable') setView({ kind: 'guide', target })
    // dismissed: 사용자가 취소 — 선택 화면 유지
  }

  return (
    <BottomSheet open={open} onClose={close} label="앱 설치하기" showClose>
      {standalone ? (
        <div className={styles.center}>
          <p className={styles.title}>이미 앱으로 설치되어 있어요</p>
          <p className={styles.description}>홈 화면의 붕붕어스 아이콘으로 실행할 수 있어요.</p>
        </div>
      ) : view.kind === 'choose' ? (
        <div className={styles.body}>
          <div className={styles.texts}>
            <h2 className={styles.title}>앱 설치하기</h2>
            <p className={styles.description}>홈 화면에 추가하고 앱처럼 바로 실행해 보세요.</p>
          </div>
          <ul className={styles.options}>
            {TARGETS.map((t) => (
              <li key={t.id}>
                <button type="button" className={styles.option} onClick={() => handleSelect(t.id)}>
                  <span className={styles.emoji} aria-hidden>
                    {t.emoji}
                  </span>
                  <span className={styles.optionTexts}>
                    <span className={styles.optionLabel}>{t.label}</span>
                    <span className={styles.optionDesc}>{t.description}</span>
                  </span>
                  <span className={styles.chevron} aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : view.kind === 'done' ? (
        <div className={styles.center}>
          <p className={styles.title}>설치가 시작됐어요!</p>
          <p className={styles.description}>설치가 끝나면 홈 화면에서 붕붕어스를 찾을 수 있어요.</p>
          <Button size="dialog" fullWidth onClick={close}>
            확인
          </Button>
        </div>
      ) : (
        <InstallGuide target={view.target} platform={platform} onBack={() => setView({ kind: 'choose' })} />
      )}
    </BottomSheet>
  )
}

const GUIDE_TITLE: Record<Target, string> = {
  galaxy: '갤럭시에서 설치하기',
  iphone: '아이폰에서 설치하기',
  pc: 'PC에서 설치하기',
}

function guideSteps(target: Target, platform: Platform): string[] {
  const inKakao = platform.inApp === 'kakaotalk'
  if (target === 'iphone') {
    return [
      ...(inKakao ? ['카카오톡 화면 오른쪽 아래 ⋯ 버튼 → [Safari로 열기]를 눌러요.'] : ['Safari(사파리)에서 붕붕어스를 열어요.']),
      '화면 아래쪽의 공유 버튼(네모에 위쪽 화살표)을 눌러요.',
      '목록을 내려 [홈 화면에 추가]를 눌러요.',
      '오른쪽 위 [추가]를 누르면 홈 화면에 붕붕어스 아이콘이 생겨요.',
    ]
  }
  if (target === 'galaxy') {
    return [
      ...(inKakao ? ['카카오톡 화면 오른쪽 위 ⋮ 버튼 → [다른 브라우저로 열기]로 크롬이나 삼성 인터넷에서 열어요.'] : []),
      '브라우저 메뉴(⋮ 또는 ≡)를 열어요.',
      '[앱 설치] 또는 [홈 화면에 추가]를 눌러요.',
      '[설치]를 누르면 홈 화면에 붕붕어스 아이콘이 생겨요.',
    ]
  }
  return [
    '크롬 또는 엣지에서 붕붕어스를 열어요.',
    '주소창 오른쪽의 설치 아이콘(모니터에 아래 화살표)을 눌러요. 안 보이면 메뉴(⋮) → [앱 설치] / [이 사이트를 앱으로 설치]를 선택해요.',
    '[설치]를 누르면 바탕화면과 시작 메뉴에서 붕붕어스를 실행할 수 있어요.',
  ]
}

function InstallGuide({ target, platform, onBack }: { target: Target; platform: Platform; onBack: () => void }) {
  return (
    <div className={styles.body}>
      <div className={styles.guideHeader}>
        <IconButton icon="back" label="설치 방법 선택으로 돌아가기" variant="plain" onClick={onBack} />
        <h2 className={styles.title}>{GUIDE_TITLE[target]}</h2>
      </div>
      <ol className={styles.steps} aria-label="설치 순서">
        {guideSteps(target, platform).map((step, i) => (
          <li key={step} className={styles.step}>
            <span className={styles.stepNumber}>{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {target !== 'iphone' && (
        <p className={styles.note}>설치 버튼이 보이지 않으면 이미 설치되어 있거나, 브라우저가 앱 설치를 지원하지 않는 경우예요.</p>
      )}
    </div>
  )
}
