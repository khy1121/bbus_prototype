import { memo, useState } from 'react'
import { Button } from '@/components'
import { icons, images } from '../assets'
import { useDriveDataStore } from '../stores/driveDataStore'
import type { RestStop } from '../types'
import { ManualStampModal } from './ManualStampModal'
import { RestStopModal } from './RestStopModal'
import styles from './StampPanel.module.scss'

/** 도장판 칸 수 — 처음부터 16칸 고정 (레벨에 따른 확장 없음) */
export const STAMP_BOARD_SIZE = 16

/** 도장판 위 슬롯 좌표 (Figma 10:10416 기준, 보드 359×630 대비 %) */
const SLOTS: [number, number][] = [
  [114, 245],
  [193, 235],
  [304, 300],
  [193, 343],
  [111, 343],
  [18, 380],
  [78, 441],
  [304, 464],
  [215, 544],
  [132, 544],
  [21, 585],
  [95, 645],
  [180, 644],
  [309, 687],
  [188, 753],
  [99, 728],
].map(([x, y]) => [((x - 16) / 359) * 100, ((y - 201) / 630) * 100])

type StampPanelProps = { restStops: RestStop[] }

/** 06 휴게소 스탬프 탭 (Figma 10:10346) */
export const StampPanel = memo(function StampPanel({ restStops }: StampPanelProps) {
  const stamps = useDriveDataStore((s) => s.stamps)
  const acquireStamp = useDriveDataStore((s) => s.acquireStamp)
  const [selected, setSelected] = useState<RestStop | null>(null)
  const [manualOpen, setManualOpen] = useState(false)
  const boardStops = restStops.slice(0, STAMP_BOARD_SIZE)
  const acquiredCount = boardStops.filter((r) => stamps[r.id]).length

  return (
    <section className={styles.panel} aria-labelledby="stamp-title">
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          함께 모아가는 작은 드라이브 기록
          <img src={icons.roadMap} alt="" aria-hidden />
        </p>
        <div className={styles.titleRow}>
          <h2 id="stamp-title" className={styles.title}>
            휴게소 스탬프
          </h2>
          <span className={styles.count}>{`${acquiredCount} / ${STAMP_BOARD_SIZE}`}</span>
        </div>
        <Button variant="secondary" size="sm" className={styles.manual} onClick={() => setManualOpen(true)}>
          도장 찍기
        </Button>
      </div>

      <div className={styles.board}>
        <img className={styles.boardImage} src={images.stampBoard} alt="" aria-hidden />
        {SLOTS.map(([left, top], i) => {
          const stop = boardStops[i]
          // 아직 휴게소가 배정되지 않은 칸은 잠긴 도장으로만 표시
          if (!stop) {
            return (
              <span
                key={`empty-${i}`}
                className={styles.slot}
                style={{ left: `${left}%`, top: `${top}%` }}
                data-testid="stamp-slot"
              >
                <img src={images.stampLocked} alt="" aria-hidden />
              </span>
            )
          }
          const acquired = Boolean(stamps[stop.id])
          const src = acquired ? (stop.stampColor === 'pink' ? images.stampPink : images.stamp) : images.stampLocked
          return (
            <button
              key={stop.id}
              type="button"
              className={styles.slot}
              style={{ left: `${left}%`, top: `${top}%` }}
              data-testid="stamp-slot"
              aria-label={`${stop.name} 스탬프 (${acquired ? '획득' : '미획득'})`}
              onClick={() => setSelected(stop)}
            >
              <img src={src} alt="" aria-hidden />
            </button>
          )
        })}
      </div>

      <RestStopModal
        restStop={selected}
        acquired={Boolean(selected && stamps[selected.id])}
        onClose={() => setSelected(null)}
      />
      <ManualStampModal
        open={manualOpen}
        restStops={restStops}
        onClose={() => setManualOpen(false)}
        onSubmit={(stop) => {
          acquireStamp(stop.id)
          setManualOpen(false)
        }}
      />
    </section>
  )
})
