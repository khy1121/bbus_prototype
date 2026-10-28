import { useEffect, useState, type FormEvent } from 'react'
import { BottomSheet, Button, Icon, TextField } from '@/components'
import styles from './DriveStartSheet.module.scss'

type DriveStartSheetProps = {
  open: boolean
  onClose: () => void
  /** 입력한 드라이브명 (비어 있을 수 있음) */
  onStart: (name: string) => void
  /** start: 드라이브 준비 완료 / rename: 드라이브명 수정하기 */
  mode?: 'start' | 'rename'
  carName?: string
  initialName?: string
}

const MAX_NAME_LENGTH = 20

/** 드라이브명 입력/수정 팝업 (Figma 10:15866, 10:16812) */
export function DriveStartSheet({
  open,
  onClose,
  onStart,
  mode = 'start',
  carName = '',
  initialName = '',
}: DriveStartSheetProps) {
  const [name, setName] = useState(initialName)
  const isRename = mode === 'rename'
  const title = isRename ? '드라이브명 수정하기' : '드라이브 준비 완료!'

  useEffect(() => {
    if (open) setName(initialName)
  }, [open, initialName])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onStart(name.trim())
  }

  return (
    <BottomSheet open={open} onClose={onClose} label={title}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.texts}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>오늘의 드라이브에 이름을 붙여주세요.</p>
        </div>
        <TextField
          label="드라이브명"
          placeholder="예시: 우리의 첫 바다 드라이브"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        {isRename ? (
          <Button type="submit" size="pill" className={styles.submit} leftIcon={<Icon name="car-button" />}>
            수정 완료
          </Button>
        ) : (
          <Button type="submit" size="pill" className={styles.submit} leftIcon={<Icon name="car-button" />}>
            {`붕붕! ${carName} 출발`}
          </Button>
        )}
      </form>
    </BottomSheet>
  )
}
