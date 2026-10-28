import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import { icons, images } from '../../assets'
import { SubPage } from '../../components/SubPage'
import { useDriveDataStore } from '../../stores/driveDataStore'
import { useRadioStore } from '../../stores/radioStore'
import { StoryDrawer } from './StoryDrawer'
import styles from './Radio.module.scss'

/**
 * 12 라디오 · 재생 중 (Figma 10:17056)
 * 재생은 전역 radioStore 가 담당 — 뒤로가기로 나가도 계속 재생되고, '중단하기'만 재생을 멈춘다.
 */
export function RadioPlayingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const stories = useDriveDataStore((s) => s.stories)
  const { story: playingStory, play, stop } = useRadioStore()
  const storyId = (location.state as { storyId?: string } | null)?.storyId ?? playingStory?.id
  const [drawerOpen, setDrawerOpen] = useState(false)
  const story = stories.find((s) => s.id === storyId) ?? (playingStory?.id === storyId ? playingStory : undefined)

  useEffect(() => setDrawerOpen(false), [storyId])

  // 다른 사연을 골라 들어오면 그 사연으로 재생 전환
  useEffect(() => {
    if (story && playingStory?.id !== story.id) play(story)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id])

  if (!story) return <Navigate to="/drive/radio" replace />

  return (
    <SubPage
      title="라디오"
      onBack={() => navigate('/drive')}
      heroTone="radio"
      hero={<img src={images.radioHero} alt="" aria-hidden />}
      right={
        <button
          type="button"
          className={styles.menuButton}
          aria-label="보낸 사연 목록"
          onClick={() => setDrawerOpen(true)}
        >
          <img src={icons.hamburger} alt="" aria-hidden />
        </button>
      }
      footer={
        <>
          <Button size="lg" fullWidth onClick={() => navigate('/drive/radio')}>
            새로운 사연 보내기
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => {
              stop()
              navigate('/drive')
            }}
          >
            중단하기
          </Button>
        </>
      }
    >
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>사연 재생 중</h2>
        <div className={styles.script} aria-live="polite">
          {story.script}
        </div>
      </div>
      <StoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelect={(id) => navigate('/drive/radio/playing', { state: { storyId: id }, replace: true })}
        onCompose={() => navigate('/drive/radio')}
      />
    </SubPage>
  )
}
