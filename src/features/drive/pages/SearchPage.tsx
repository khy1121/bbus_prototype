import { Fragment, useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState, PlaceCard, type PlaceSummary } from '@/components'
import { LocationPermissionDialog } from '@/features/permissions/LocationPermissionDialog'
import { useDriveStore, type Destination } from '@/stores/driveStore'
import { CategoryChips } from '@/features/home/components/CategoryChips'
import { CATEGORIES } from '@/features/home/mocks'
import type { CategoryId } from '@/features/home/types'
import { getCurrentLocation, getPopularRoutes, getRecommendedPlaces, searchPlaces } from '../api'
import { icons, images } from '../assets'
import { useDriveDataStore } from '../stores/driveDataStore'
import type { Place } from '../types'
import { splitHighlight } from '../utils/format'
import styles from './SearchPage.module.scss'

/** 출발지/도착지 칸의 값: 내 위치 · 장소 · 비어 있음 */
type Endpoint = { kind: 'me' } | { kind: 'place'; place: Place } | { kind: 'empty' }
type Field = 'from' | 'to'

const ME: Endpoint = { kind: 'me' }
const EMPTY: Endpoint = { kind: 'empty' }
const endpointId = (e: Endpoint) => (e.kind === 'place' ? e.place.id : 'me')
const toEndpoint = (d: Destination | null, fallback: Endpoint): Endpoint =>
  d ? { kind: 'place', place: { ...d, distanceKm: 0 } } : fallback
const asPlace = (p: Place | PlaceSummary): Place =>
  'position' in p ? p : { id: p.id, name: p.name, address: p.region, distanceKm: 0, position: { lat: 0, lng: 0 } }

/** 02 장소 검색 / 03 장소 검색 결과 (Figma 10:16282, 10:16617) */
export function SearchPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const origin = useDriveStore((s) => s.origin)
  const destination = useDriveStore((s) => s.destination)
  const { recentSearches, addRecentSearch, removeRecentSearch } = useDriveDataStore()

  const [address, setAddress] = useState('')
  const [locationError, setLocationError] = useState(false)
  const [from, setFrom] = useState<Endpoint>(() => toEndpoint(origin, ME))
  const [to, setTo] = useState<Endpoint>(() => toEndpoint(destination, EMPTY))
  /** 지금 입력 중인 칸 */
  const [active, setActive] = useState<Field>('to')
  const [input, setInput] = useState(query || destination?.name || '')
  const [results, setResults] = useState<Place[] | null>(null)
  const [popular, setPopular] = useState<PlaceSummary[]>([])
  /** 테마 칩 — 고르면 추천 장소를 그 테마로 거른다, 다시 누르면 해제 */
  const [theme, setTheme] = useState<CategoryId | null>(null)
  const [recommended, setRecommended] = useState<PlaceSummary[]>([])

  const loadLocation = () =>
    getCurrentLocation({ fresh: true })
      .then((loc) => {
        setAddress(loc.address)
        setLocationError(false)
      })
      .catch(() => setLocationError(true))

  useEffect(() => {
    loadLocation()
    getPopularRoutes().then(setPopular)
  }, [])

  useEffect(() => {
    if (!query) {
      setResults(null)
      return
    }
    setInput(query)
    let cancelled = false
    searchPlaces(query).then((r) => !cancelled && setResults(r))
    return () => {
      cancelled = true
    }
  }, [query])

  const search = (keyword: string) => {
    const k = keyword.trim()
    if (!k) return
    addRecentSearch(k)
    setParams({ q: k })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    search(input)
  }

  /** 입력 칸 전환 — 해당 칸을 입력 상태로 */
  const editField = (field: Field, current: Endpoint = field === 'from' ? from : to) => {
    setActive(field)
    setInput(current.kind === 'place' ? current.place.name : '')
    setParams({})
  }

  /** 양쪽이 정해지면 경로 미리보기로 */
  const openPreview = (nextFrom: Endpoint, nextTo: Endpoint) => {
    if (nextTo.kind === 'empty' || nextFrom.kind === 'empty') return false
    if (nextFrom.kind === 'me' && nextTo.kind === 'me') return false
    navigate(`/drive/route/${endpointId(nextTo)}?from=${endpointId(nextFrom)}`, { state: { fromSearch: true } })
    return true
  }

  /** 장소 선택 → 입력 중인 칸에 넣는다 */
  useEffect(() => {
    if (!theme) return
    let alive = true
    getRecommendedPlaces(theme).then((places) => alive && setRecommended(places))
    return () => {
      alive = false
    }
  }, [theme])

  const themeLabel = CATEGORIES.find((c) => c.id === theme)?.label
  const shownPlaces = theme ? recommended : popular

  const choose = (place: Place | PlaceSummary, field: Field = active) => {
    const picked: Endpoint = { kind: 'place', place: asPlace(place) }
    const nextFrom = field === 'from' ? picked : from
    const nextTo = field === 'to' ? picked : to
    setFrom(nextFrom)
    setTo(nextTo)
    if (openPreview(nextFrom, nextTo)) return
    // 출발지를 골랐으면 이어서 도착지 입력
    const next: Field = field === 'from' ? 'to' : 'from'
    editField(next, next === 'from' ? nextFrom : nextTo)
  }

  /** 입력 중인 칸을 '내 위치'로 */
  const setMine = (field: Field) => {
    if (field === 'from') setFrom(ME)
    else setTo(ME)
    const next: Field = field === 'from' ? 'to' : 'from'
    editField(next, next === 'from' ? from : to)
  }

  /** 출발·도착 맞바꾸기 — 비어 있는 칸이 있으면 그 칸을 입력 상태로 */
  const swap = () => {
    const nextFrom = to
    const nextTo = from
    setFrom(nextFrom)
    setTo(nextTo)
    const next: Field = nextFrom.kind === 'empty' ? 'from' : 'to'
    editField(next, next === 'from' ? nextFrom : nextTo)
  }

  const endpointText = (e: Endpoint) =>
    e.kind === 'me' ? `내 위치${address ? ` (${address})` : ''}` : e.kind === 'place' ? e.place.name : '비어 있음'

  const renderValue = (e: Endpoint, field: Field) => {
    if (e.kind === 'me')
      return (
        <span className={styles.myLocation}>
          내 위치 {address && <span className={styles.address}>{`(${address})`}</span>}
        </span>
      )
    if (e.kind === 'place') return <span className={styles.myLocation}>{e.place.name}</span>
    return <span className={styles.placeholder}>{field === 'from' ? '출발지를 입력해주세요.' : '도착지를 입력해주세요.'}</span>
  }

  const renderField = (field: Field) => {
    const value = field === 'from' ? from : to
    const name = field === 'from' ? '출발지' : '도착지'
    if (active === field) {
      return (
        <form role="search" className={styles.fieldForm} onSubmit={handleSubmit}>
          <label htmlFor={`drive-${field}`} className={styles.hidden}>
            {name}
          </label>
          <input
            id={`drive-${field}`}
            type="search"
            className={styles.toInput}
            placeholder={`${name}를 입력해주세요.`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </form>
      )
    }
    return (
      <button type="button" className={styles.fieldButton} aria-label={`${name}: ${endpointText(value)}`} onClick={() => editField(field)}>
        {renderValue(value, field)}
      </button>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.routeBox}>
        <img className={styles.routeDots} src={icons.routeDots} alt="" aria-hidden />
        <button type="button" className={styles.swap} aria-label="출발지와 도착지 바꾸기" onClick={swap}>
          <img src={icons.swap} alt="" aria-hidden />
        </button>
        <div className={styles.fields}>
          <div className={styles.from} data-testid="route-from">
            {renderField('from')}
          </div>
          <div className={styles.toForm} data-testid="route-to">
            {renderField('to')}
          </div>
        </div>
        {/* TODO: 경유지 추가 결과 화면 미정 (명세 '해당 결과 화면 아직 X') */}
        <button type="button" className={styles.add} aria-label="경유지 추가">
          +
        </button>
        <button type="button" className={styles.close} aria-label="닫기" onClick={() => navigate('/drive')}>
          <img src={icons.closeLarge} alt="" aria-hidden />
        </button>
      </div>

      {/* 출발지 입력 중에는 바로 '내 위치'로 되돌릴 수 있게 (디자인 없음 → 추가) */}
      {active === 'from' && (
        <button type="button" className={styles.useMine} onClick={() => setMine(active)}>
          <img src={icons.recentPin} alt="" aria-hidden />
          내 위치로 설정
        </button>
      )}

      {results === null ? (
        <>
          {/* 테마 칩 (Figma 10:16282) — 추천 장소 필터 */}
          <CategoryChips
            className={styles.themes}
            label="추천 테마"
            selected={theme}
            onSelect={(c) => {
              setRecommended([])
              setTheme((current) => (current === c ? null : c))
            }}
          />

          <ul className={styles.recent} aria-label="최근 검색어">
            {recentSearches.map((r) => (
              <li key={r.id} className={styles.recentItem}>
                <button type="button" className={styles.recentMain} onClick={() => search(r.keyword)}>
                  <img src={icons.recentPin} alt="" aria-hidden />
                  <span className={styles.recentKeyword}>{r.keyword}</span>
                </button>
                <span className={styles.recentDate}>{r.date}</span>
                <button
                  type="button"
                  className={styles.recentDelete}
                  aria-label={`${r.keyword} 삭제`}
                  onClick={() => removeRecentSearch(r.id)}
                >
                  <img src={icons.xSmall} alt="" aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <section className={styles.popular} aria-labelledby="popular-title">
            <h2 id="popular-title" className={styles.popularTitle}>
              {themeLabel ? `${themeLabel} 추천 드라이브` : '인기 드라이브 경로 BEST'}
            </h2>
            <div className={styles.popularList}>
              {shownPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} onClick={() => choose(place, 'to')} />
              ))}
            </div>
          </section>
        </>
      ) : results.length === 0 ? (
        <EmptyState title="검색 결과가 없어요" description={'검색어를 다시 확인하거나\n다른 장소를 찾아보세요.'} />
      ) : (
        <ul className={styles.results} aria-label="검색 결과">
          {results.map((place) => (
            <li key={place.id}>
              <button type="button" className={styles.result} onClick={() => choose(place)}>
                <img className={styles.resultIcon} src={images.arrowTurn} alt="" aria-hidden />
                <span className={styles.resultBody}>
                  <span className={styles.resultName}>
                    {splitHighlight(place.name, query).map((part, i) =>
                      part.match ? <mark key={i}>{part.text}</mark> : <Fragment key={i}>{part.text}</Fragment>,
                    )}
                  </span>
                  <span className={styles.resultMeta}>
                    <span>{`${place.distanceKm}km`}</span>
                    <span className={styles.divider} aria-hidden />
                    <span className={styles.resultAddress}>{place.address}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <LocationPermissionDialog
        open={locationError && (from.kind === 'me' || to.kind === 'me')}
        onClose={() => setLocationError(false)}
        onOpenSettings={loadLocation}
      />
    </div>
  )
}
