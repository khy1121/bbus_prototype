import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, TextArea } from '@/components'
import { getRandomStory, sendStory } from '../../api'
import { icons, images } from '../../assets'
import { SubPage } from '../../components/SubPage'
import { useDriveDataStore } from '../../stores/driveDataStore'
import { useRadioStore } from '../../stores/radioStore'
import { StoryDrawer } from './StoryDrawer'
import styles from './Radio.module.scss'

const MAX_LENGTH = 300

/** 11 라디오 · 사연 입력 (Figma 10:17034) */
export function RadioPage() {
  const navigate = useNavigate()
  const addStory = useDriveDataStore((s) => s.addStory)
  const playRadio = useRadioStore((s) => s.play)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const openPlaying = (storyId: string) => navigate('/drive/radio/playing', { state: { storyId } })

  // 사연 보내기 → 재생을 시작하고 드라이브 화면으로 (라디오 카드에 '재생 중', Figma 10:9309)
  const handleSend = async () => {
    setSending(true)
    const story = await sendStory(text.trim())
    addStory(story)
    playRadio(story)
    navigate('/drive')
  }

  const handleRandom = async () => {
    setSending(true)
    const story = await getRandomStory()
    addStory(story)
    playRadio(story)
    openPlaying(story.id)
  }

  return (
    <SubPage
      title="라디오"
      onBack={() => navigate('/drive')}
      heroTone="radio"
      hero={<img src={images.radioHero} alt="" aria-hidden />}
      right={
        <button type="button" className={styles.menuButton} aria-label="보낸 사연 목록" onClick={() => setDrawerOpen(true)}>
          <img src={icons.hamburger} alt="" aria-hidden />
        </button>
      }
      footer={
        <>
          <Button size="lg" fullWidth disabled={!text.trim() || sending} onClick={handleSend}>
            사연 보내기
          </Button>
          <Button variant="secondary" size="lg" fullWidth disabled={sending} onClick={handleRandom}>
            랜덤 사연 START!
          </Button>
        </>
      }
    >
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>사연 입력하기</h2>
        <p className={styles.sectionDesc}>
          연인과의 추억부터 소소한 일상까지,
          <br />
          여러분의 이야기를 DJ의 목소리로 전해드릴게요.
        </p>
        <TextArea
          label="사연"
          className={styles.textarea}
          placeholder="예) 남자친구에게 고마운 마음을 전하고 싶어요."
          maxLength={MAX_LENGTH}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
        />
      </div>
      <StoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSelect={openPlaying} onCompose={() => setDrawerOpen(false)} />
    </SubPage>
  )
}
