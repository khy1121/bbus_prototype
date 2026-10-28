import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Portal } from '@/components'
import backIcon from '@/assets/icons/back.svg'
import { useOverlay } from '@/hooks/useOverlay'
import { buildCalendar } from '../utils/calendar'
import { toIsoDate } from '../utils/format'
import styles from './CalendarSheet.module.scss'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

type CalendarSheetProps = {
  open: boolean
  onClose: () => void
  onSelect: (iso: string) => void
  /** 기록이 있는 날짜(YYYY-MM-DD) — 이 날짜만 선택 가능 */
  recordDates: string[]
  initialMonth: { year: number; month: number }
  /** 오늘(YYYY-MM-DD) — 코랄 원으로 강조 */
  today: string
  selected?: string | null
}

/** 날짜 검색 달력 패널 (Figma 10:14661) */
export function CalendarSheet({ open, onClose, onSelect, recordDates, initialMonth, today, selected }: CalendarSheetProps) {
  const [view, setView] = useState(initialMonth)
  useOverlay(open, onClose)

  useEffect(() => {
    if (open) setView(initialMonth)
    // initialMonth 객체 동일성 대신 값으로 비교
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMonth.year, initialMonth.month])

  if (!open) return null

  const move = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(year, month - 1 + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() + 1 }
    })

  const highlighted = selected ?? today
  const recordSet = new Set(recordDates)

  return (
    <Portal>
      <div className={styles.overlay} data-testid="calendar-overlay" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="날짜로 검색"
          className={styles.sheet}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <button type="button" className={styles.nav} aria-label="이전 달" onClick={() => move(-1)}>
              <img src={backIcon} alt="" aria-hidden />
            </button>
            <h2 className={styles.title}>{`${view.year}년 ${view.month}월`}</h2>
            <button type="button" className={clsx(styles.nav, styles.next)} aria-label="다음 달" onClick={() => move(1)}>
              <img src={backIcon} alt="" aria-hidden />
            </button>
          </div>
          <div className={styles.grid} role="grid">
            <div role="row" className={styles.row}>
              {WEEKDAYS.map((w) => (
                <span key={w} role="columnheader" className={styles.weekday}>
                  {w}
                </span>
              ))}
            </div>
            {buildCalendar(view.year, view.month).map((week, i) => (
              <div role="row" key={i} className={styles.row}>
                {week.map((day, j) => {
                  if (!day) return <span key={j} role="gridcell" />
                  const iso = toIsoDate(view.year, view.month, day)
                  const hasRecord = recordSet.has(iso)
                  const isHighlighted = iso === highlighted
                  return (
                    <span key={j} role="gridcell">
                      <button
                        type="button"
                        className={clsx(styles.day, hasRecord && styles.hasRecord, isHighlighted && styles.highlighted)}
                        aria-label={`${view.month}월 ${day}일`}
                        aria-current={iso === today ? 'date' : undefined}
                        aria-pressed={iso === selected}
                        disabled={!hasRecord}
                        onClick={() => onSelect(iso)}
                      >
                        {day}
                      </button>
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Portal>
  )
}
