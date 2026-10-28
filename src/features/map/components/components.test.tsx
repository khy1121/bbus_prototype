import { screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import { setup } from '@/test/utils'
import type { DriveRecord } from '../types'
import { CalendarSheet } from './CalendarSheet'
import { buildRecordMarkers, MapCanvas } from './MapCanvas'
import { PhotoCollage } from './PhotoCollage'
import { PlaylistCard } from './PlaylistCard'
import { PolaroidCard } from './PolaroidCard'
import { RecordListItem } from './RecordListItem'
import { RecordMessage } from './RecordMessage'
import { RecordStats } from './RecordStats'
import { ShareRecordSheet } from './ShareRecordSheet'

const record: DriveRecord = {
  id: 'r01',
  title: '우리의 첫 바다 드라이브',
  place: '시흥 오이도',
  date: '2026-11-03',
  distanceKm: 43.3,
  durationMin: 80,
  stampCount: 2,
  position: { lat: 37.345, lng: 126.687 },
  thumbnail: '/t1.jpg',
  photos: ['/p1.jpg', '/p2.jpg', '/p3.jpg', '/p4.jpg', '/p5.jpg'],
  playlist: { title: '노을처럼 따뜻한 우리', trackCount: 13, cover: '/c.jpg' },
  messages: { driver: '노을은 진짜 예뻤다', passenger: '다음에 또 가자!' },
}
const record2: DriveRecord = { ...record, id: 'r02', title: '반짝이는 야경 드라이브', position: { lat: 35.18, lng: 129.08 } }

describe('MapCanvas (카카오맵)', () => {
  it('기록마다 위경도 그대로 사진 마커를 만든다', () => {
    const markers = buildRecordMarkers([record, record2], () => {})
    expect(markers.map((m) => [m.id, m.position])).toEqual([
      [record.id, record.position],
      [record2.id, record2.position],
    ])
    expect(markers.every((m) => m.clickable)).toBe(true)
  })

  it('마커 DOM 은 접근 가능한 버튼이고, 누르면 onSelect(record) 를 호출한다', () => {
    const onSelect = vi.fn()
    const [marker] = buildRecordMarkers([record], onSelect)
    const el = marker.render!()
    expect(el.tagName).toBe('BUTTON')
    expect(el).toHaveAttribute('aria-label', '우리의 첫 바다 드라이브 기록 보기')
    expect(el.querySelector('img[src="/t1.jpg"]')).not.toBeNull()
    el.click()
    expect(onSelect).toHaveBeenCalledWith(record)
  })

  it('키가 없으면 카카오맵 플레이스홀더를 보여준다', () => {
    setup(<MapCanvas records={[record]} onSelect={() => {}} />)
    expect(screen.getByRole('region', { name: '드라이브 기록 지도' })).toBeInTheDocument()
  })
})

describe('PolaroidCard', () => {
  it('사진, 제목, 한국어 날짜를 보여주고 클릭 시 onClick', async () => {
    const onClick = vi.fn()
    const { user } = setup(<PolaroidCard record={record} onClick={onClick} />)
    expect(screen.getByRole('img', { name: '우리의 첫 바다 드라이브' })).toHaveAttribute('src', '/t1.jpg')
    expect(screen.getByText('2026년 11월 3일')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /우리의 첫 바다 드라이브/ }))
    expect(onClick).toHaveBeenCalled()
  })
})

describe('RecordListItem', () => {
  it('날짜 블록, 썸네일, 제목, 장소, 거리, 시간을 보여준다', async () => {
    const onClick = vi.fn()
    const { user } = setup(<RecordListItem record={record} onClick={onClick} />)
    const item = screen.getByRole('button', { name: /우리의 첫 바다 드라이브/ })
    ;['2026년', '11.03', '화', '시흥 오이도', '43.3km', '1시간 20분'].forEach((t) =>
      expect(within(item).getByText(t)).toBeInTheDocument(),
    )
    await user.click(item)
    expect(onClick).toHaveBeenCalledWith('r01')
  })
})

describe('CalendarSheet', () => {
  const props = {
    open: true,
    initialMonth: { year: 2026, month: 10 },
    recordDates: ['2026-10-24', '2026-10-19'],
    today: '2026-10-28',
    onClose: () => {},
  }

  it('월 제목과 요일을 보여준다', () => {
    setup(<CalendarSheet {...props} onSelect={() => {}} />)
    expect(screen.getByRole('dialog', { name: '날짜로 검색' })).toBeInTheDocument()
    expect(screen.getByText('2026년 10월')).toBeInTheDocument()
    expect(screen.getByText('수')).toBeInTheDocument()
  })

  it('기록이 있는 날짜만 선택 가능하고 선택 시 onSelect(iso) 를 호출한다', async () => {
    const onSelect = vi.fn()
    const { user } = setup(<CalendarSheet {...props} onSelect={onSelect} />)
    expect(screen.getByRole('button', { name: '10월 23일' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '10월 24일' }))
    expect(onSelect).toHaveBeenCalledWith('2026-10-24')
  })

  it('오늘 날짜는 강조 표시(aria-current=date)', () => {
    setup(<CalendarSheet {...props} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: '10월 28일' })).toHaveAttribute('aria-current', 'date')
  })

  it('이전/다음 달로 이동한다', async () => {
    const { user } = setup(<CalendarSheet {...props} onSelect={() => {}} />)
    await user.click(screen.getByRole('button', { name: '이전 달' }))
    expect(screen.getByText('2026년 9월')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다음 달' }))
    await user.click(screen.getByRole('button', { name: '다음 달' }))
    expect(screen.getByText('2026년 11월')).toBeInTheDocument()
  })
})

describe('ShareRecordSheet', () => {
  it('제목/안내/링크/공유 버튼 4개를 보여준다', () => {
    setup(
      <ShareRecordSheet open record={record} shareUrl="https://bunbungus.app/drivemap" onClose={() => {}} onShare={() => {}} />,
    )
    expect(screen.getByRole('dialog', { name: '드라이브 기록 카드 공유하기' })).toBeInTheDocument()
    expect(screen.getByText('드라이브 기록 카드')).toBeInTheDocument()
    expect(screen.getByText('우리가 함께 달린 길을 공유해보세요.')).toBeInTheDocument()
    expect(screen.getByText('https://bunbungus.app/drivemap')).toBeInTheDocument()
    ;['카카오톡', '인스타그램', 'X', '페이스북'].forEach((n) =>
      expect(screen.getByRole('button', { name: n })).toBeInTheDocument(),
    )
  })

  it('링크 복사 버튼은 클립보드에 링크를 쓴다', async () => {
    const { user } = setup(
      <ShareRecordSheet open record={record} shareUrl="https://bunbungus.app/drivemap" onClose={() => {}} onShare={() => {}} />,
    )
    await user.click(screen.getByRole('button', { name: '링크 복사' }))
    await expect(navigator.clipboard.readText()).resolves.toBe('https://bunbungus.app/drivemap')
  })

  it('공유 채널을 누르면 onShare(channel) 을 호출한다', async () => {
    const onShare = vi.fn()
    const { user } = setup(
      <ShareRecordSheet open record={record} shareUrl="u" onClose={() => {}} onShare={onShare} />,
    )
    await user.click(screen.getByRole('button', { name: '인스타그램' }))
    expect(onShare).toHaveBeenCalledWith('instagram')
  })
})

describe('카드 상세 구성요소', () => {
  it('RecordStats: 이동 거리/주행 시간/휴게소 도장', () => {
    setup(<RecordStats record={record} />)
    expect(screen.getByText('이동 거리')).toBeInTheDocument()
    expect(screen.getByText('43.3km')).toBeInTheDocument()
    expect(screen.getByText('1시간 20분')).toBeInTheDocument()
    expect(screen.getByText('2개')).toBeInTheDocument()
  })

  it('PlaylistCard: 라벨/제목/메타와 재생 버튼', async () => {
    const onPlay = vi.fn()
    const { user } = setup(<PlaylistCard playlist={record.playlist!} onPlay={onPlay} />)
    expect(screen.getByText('함께 들었던 플레이리스트')).toBeInTheDocument()
    expect(screen.getByText('노을처럼 따뜻한 우리')).toBeInTheDocument()
    expect(screen.getByText('총 13곡 · 약 00분', { normalizer: (s) => s.replace(/\s+/g, ' ') })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '플레이리스트 보기' }))
    expect(onPlay).toHaveBeenCalled()
  })

  it('PhotoCollage: 최대 3장 + 남은 장수 +N', () => {
    setup(<PhotoCollage photos={record.photos} title="t" />)
    expect(screen.getAllByRole('img')).toHaveLength(3)
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('PhotoCollage: 3장 이하면 +N 이 없다', () => {
    setup(<PhotoCollage photos={['/a', '/b']} title="t" />)
    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it('RecordMessage: 역할 라벨과 한줄 문구', () => {
    setup(<RecordMessage role="driver" message="노을은 진짜 예뻤다" />)
    expect(screen.getByText('운전자')).toBeInTheDocument()
    expect(screen.getByText('노을은 진짜 예뻤다')).toBeInTheDocument()
  })
})
