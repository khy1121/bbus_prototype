import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import clsx from 'clsx'
import { nextSnap, resolveSnap, type SnapPoint } from './resolveSnap'
import styles from './DraggableSheet.module.scss'

type DraggableSheetProps = {
  snap: SnapPoint
  onSnapChange: (snap: SnapPoint) => void
  /** 스냅별 시트 높이(px) */
  heights: Record<SnapPoint, number>
  /** 시트 상단 고정 영역(탭 등) */
  header?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * 드라이브 화면 하단 시트 — 접힘/중간/전체 3단계 드래그 스냅.
 * 핸들을 끌어 올리거나 내리고, 핸들 클릭(키보드 포함)으로도 단계 순환.
 */
export function DraggableSheet({ snap, onSnapChange, heights, header, children, className }: DraggableSheetProps) {
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const drag = useRef<{ startY: number; startHeight: number; lastY: number; lastT: number; v: number; moved: boolean }>(
    null,
  )

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = {
      startY: e.clientY,
      startHeight: heights[snap],
      lastY: e.clientY,
      lastT: e.timeStamp,
      v: 0,
      moved: false,
    }
  }

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    const dy = d.startY - e.clientY
    if (Math.abs(dy) > 4) d.moved = true
    const dt = Math.max(e.timeStamp - d.lastT, 1)
    d.v = (d.lastY - e.clientY) / dt
    d.lastY = e.clientY
    d.lastT = e.timeStamp
    const next = Math.min(Math.max(d.startHeight + dy, heights.collapsed), heights.full)
    setDragHeight(next)
  }

  const handlePointerUp = () => {
    const d = drag.current
    drag.current = null
    if (!d || !d.moved || dragHeight === null) {
      setDragHeight(null)
      return
    }
    onSnapChange(resolveSnap(dragHeight, d.v, heights))
    setDragHeight(null)
  }

  const handleClick = () => {
    // 드래그 후 발생하는 click 은 무시 (pointerup 에서 처리)
    if (dragHeight !== null) return
    onSnapChange(nextSnap(snap))
  }

  const height = dragHeight ?? heights[snap]

  return (
    <section
      data-testid="draggable-sheet"
      data-snap={snap}
      className={clsx(styles.sheet, dragHeight !== null && styles.dragging, className)}
      style={{ height }}
    >
      <button
        type="button"
        className={styles.handleArea}
        aria-label="시트 높이 조절"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
      >
        <span className={styles.handle} />
      </button>
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.content}>{children}</div>
    </section>
  )
}
