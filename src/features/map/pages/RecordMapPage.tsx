import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Icon, SearchField, SegmentedControl } from '@/components'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { getRecordShareUrl } from '../api'
import characterHeader from '../assets/character-header.webp'
import { CalendarSheet } from '../components/CalendarSheet'
import { MapCanvas } from '../components/MapCanvas'
import { PolaroidOverlay } from '../components/PolaroidOverlay'
import { RecordList } from '../components/RecordList'
import { ShareRecordSheet } from '../components/ShareRecordSheet'
import { todayIso, useDriveRecords } from '../hooks'
import type { DriveRecord } from '../types'
import { useShareRecord } from '../useShareRecord'
import { filterRecords } from '../utils/filter'
import { formatKoreanDate } from '../utils/format'
import styles from './RecordMapPage.module.scss'

type View = 'map' | 'list'
const VIEW_OPTIONS = [
  { value: 'map', label: '지도형' },
  { value: 'list', label: '목록형' },
] as const

/** 기록 지도 (Figma 10:14494) */
export function RecordMapPage() {
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()
  const share = useShareRecord()
  const { records } = useDriveRecords()

  const [view, setView] = useState<View>('map')
  const [query, setQuery] = useState('')
  const [date, setDate] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selected, setSelected] = useState<DriveRecord | null>(null)
  const [shareTarget, setShareTarget] = useState<DriveRecord | null>(null)

  const filtered = useMemo(() => filterRecords(records, { query, date }), [records, query, date])
  const recordDates = useMemo(() => records.map((r) => r.date), [records])
  const today = todayIso()
  const dateLabel = date ? formatKoreanDate(date) : null
  const calendarBase = date ?? today
  const initialMonth = { year: Number(calendarBase.slice(0, 4)), month: Number(calendarBase.slice(5, 7)) }

  const openDetail = (id: string) => navigate(`/map/cards/${id}`)

  const handleSearchChange = (value: string) => {
    if (date) {
      // 날짜 검색 중 입력하면 날짜 조건을 풀고 새 검색어로 전환
      setDate(null)
      setQuery(dateLabel ? value.replace(dateLabel, '') : value)
      return
    }
    setQuery(value)
  }

  const showList = isDesktop || view === 'list'
  const showMap = isDesktop || view === 'map'

  const header = (
    <header className={styles.header}>
      <div className={styles.headerTexts}>
        <p className={styles.count}>{`총 ${records.length}번의 드라이브를 함께했어요`}</p>
        <h1 className={styles.title}>우리 어디까지 가봤지?</h1>
      </div>
      <img className={styles.character} src={characterHeader} alt="" aria-hidden />
    </header>
  )

  const search = (
    <SearchField
      label="드라이브 기록 검색"
      placeholder="장소나 드라이브 제목을 검색해보세요."
      className={styles.search}
      value={dateLabel ?? query}
      onValueChange={handleSearchChange}
      onSearch={(v) => !date && setQuery(v)}
      trailing={
        <button type="button" className={styles.calendarButton} aria-label="날짜로 검색" onClick={() => setCalendarOpen(true)}>
          <Icon name="calendar" />
        </button>
      }
    />
  )

  return (
    <div className={clsx(styles.page, isDesktop && styles.desktop)}>
      {showMap && (
        <div className={styles.mapArea}>
          <MapCanvas records={filtered} onSelect={setSelected} />
          {selected && (
            <PolaroidOverlay
              record={selected}
              onClose={() => setSelected(null)}
              onOpen={(r) => openDetail(r.id)}
              onShare={setShareTarget}
            />
          )}
        </div>
      )}

      {isDesktop ? (
        <aside className={styles.panel}>
          {header}
          {search}
          <RecordList records={filtered} onSelect={openDetail} className={styles.panelList} />
        </aside>
      ) : (
        <>
          <div className={styles.top}>
            {header}
            {search}
          </div>
          {showList && <RecordList records={filtered} onSelect={openDetail} className={styles.listView} />}
          <SegmentedControl
            label="보기 방식"
            variant="toggle"
            options={VIEW_OPTIONS}
            value={view}
            onChange={(v) => {
              setSelected(null)
              setView(v)
            }}
            className={styles.toggle}
          />
        </>
      )}

      <CalendarSheet
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        recordDates={recordDates}
        initialMonth={initialMonth}
        today={today}
        selected={date}
        onSelect={(iso) => {
          setDate(iso)
          setQuery('')
          setSelected(null)
          setCalendarOpen(false)
        }}
      />

      {shareTarget && (
        <ShareRecordSheet
          open
          record={shareTarget}
          shareUrl={getRecordShareUrl(shareTarget.id)}
          onClose={() => setShareTarget(null)}
          onShare={(channel) => {
            const target = shareTarget
            setShareTarget(null)
            share(target, channel)
          }}
        />
      )}
    </div>
  )
}
