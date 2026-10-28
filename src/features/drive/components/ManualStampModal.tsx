import { useEffect, useId, useState } from 'react'
import clsx from 'clsx'
import { Button } from '@/components'
import { findNearestRestStop } from '../api'
import { icons, images } from '../assets'
import type { RestStop } from '../types'
import { DriveDialog } from './DriveDialog'
import styles from './ManualStampModal.module.scss'

type ManualStampModalProps = {
  open: boolean
  restStops: RestStop[]
  onClose: () => void
  onSubmit: (restStop: RestStop) => void
}

/**
 * 수동 도장 찍기 팝업 (디자인 없음 → Figma '휴게소 스탬프 수동으로 찍는 화면' 요청에 맞춰 추가)
 * - '현재 위치로 찾기': GPS 로 가까운 휴게소 자동 입력
 * - 위치가 이상하면 직접 입력해 목록에서 선택
 */
export function ManualStampModal({ open, restStops, onClose, onSubmit }: ManualStampModalProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<RestStop | null>(null)
  const [locating, setLocating] = useState(false)
  const inputId = useId()
  const listId = useId()

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(null)
    }
  }, [open])

  const candidates = query.trim() && !selected ? restStops.filter((r) => r.name.includes(query.trim())) : []

  const handleLocate = async () => {
    setLocating(true)
    const nearest = await findNearestRestStop()
    setLocating(false)
    setSelected(nearest)
    setQuery(nearest.name)
  }

  return (
    <DriveDialog open={open} onClose={onClose} label="휴게소 도장 찍기">
      <div className={styles.content}>
        <img className={styles.illust} src={images.restStop} alt="" aria-hidden />
        <div className={styles.texts}>
          <h2 className={styles.title}>휴게소 도장 찍기</h2>
          <p className={styles.description}>방문한 휴게소를 찾아 도장을 찍어주세요.</p>
        </div>

        <Button variant="tonal" size="sm" fullWidth onClick={handleLocate} disabled={locating}>
          <span className={styles.locate}>
            <img src={icons.pinCoral} alt="" aria-hidden />
            현재 위치로 찾기
          </span>
        </Button>

        <div className={styles.field}>
          <label htmlFor={inputId} className={styles.label}>
            휴게소 이름
          </label>
          <input
            id={inputId}
            className={styles.input}
            placeholder="휴게소 이름을 직접 입력해주세요."
            value={query}
            aria-controls={listId}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(null)
            }}
          />
          {candidates.length > 0 && (
            <ul id={listId} role="listbox" aria-label="휴게소 검색 결과" className={styles.options}>
              {candidates.map((stop) => (
                <li
                  key={stop.id}
                  role="option"
                  aria-selected={false}
                  tabIndex={0}
                  className={styles.option}
                  onClick={() => {
                    setSelected(stop)
                    setQuery(stop.name)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSelected(stop)
                      setQuery(stop.name)
                    }
                  }}
                >
                  <span>{stop.name}</span>
                  <span className={styles.optionHighway}>{stop.highway}</span>
                </li>
              ))}
            </ul>
          )}
          {query.trim() && !selected && candidates.length === 0 && (
            <p className={styles.empty}>일치하는 휴게소가 없어요.</p>
          )}
        </div>

        <Button
          size="dialog"
          fullWidth
          className={clsx(styles.submit)}
          disabled={!selected}
          onClick={() => selected && onSubmit(selected)}
        >
          도장 찍기 완료
        </Button>
      </div>
    </DriveDialog>
  )
}
