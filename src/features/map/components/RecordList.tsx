import { EmptyState } from '@/components'
import type { DriveRecord } from '../types'
import { RecordListItem } from './RecordListItem'
import styles from './RecordList.module.scss'

type RecordListProps = {
  records: DriveRecord[]
  onSelect: (id: string) => void
  className?: string
}

/** 목록형 (Figma 10:14853) */
export function RecordList({ records, onSelect, className }: RecordListProps) {
  if (!records.length) {
    return (
      <div className={className}>
        <EmptyState title="검색 결과가 없어요" description="다른 검색어나 날짜로 찾아보세요." />
      </div>
    )
  }
  return (
    <ul aria-label="드라이브 기록 목록" className={`${styles.list} ${className ?? ''}`}>
      {records.map((r) => (
        <li key={r.id}>
          <RecordListItem record={r} onClick={onSelect} />
        </li>
      ))}
    </ul>
  )
}
