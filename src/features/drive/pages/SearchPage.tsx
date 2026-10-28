import { Fragment, useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState, PlaceCard, type PlaceSummary } from '@/components'
import { useDriveStore } from '@/stores/driveStore'
import { getCurrentLocation, getPopularRoutes, searchPlaces } from '../api'
import { icons, images } from '../assets'
import { useDriveDataStore } from '../stores/driveDataStore'
import type { Place } from '../types'
import { splitHighlight } from '../utils/format'
import styles from './SearchPage.module.scss'

/** 02 장소 검색 / 03 장소 검색 결과 (Figma 10:16282, 10:16617) */
export function SearchPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const destination = useDriveStore((s) => s.destination)
  const { recentSearches, addRecentSearch, removeRecentSearch } = useDriveDataStore()

  const [address, setAddress] = useState('')
  const [swapped, setSwapped] = useState(false)
  const [input, setInput] = useState(query || destination?.name || '')
  const [results, setResults] = useState<Place[] | null>(null)
  const [popular, setPopular] = useState<PlaceSummary[]>([])

  useEffect(() => {
    getCurrentLocation().then((loc) => setAddress(loc.address))
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

  const myLocation = (
    <span className={styles.myLocation}>
      내 위치 {address && <span className={styles.address}>{`(${address})`}</span>}
    </span>
  )

  return (
    <div className={styles.page}>
      <div className={styles.routeBox}>
        <img className={styles.routeDots} src={icons.routeDots} alt="" aria-hidden />
        <button type="button" className={styles.swap} aria-label="출발지와 도착지 바꾸기" onClick={() => setSwapped((v) => !v)}>
          <img src={icons.swap} alt="" aria-hidden />
        </button>
        <div className={styles.fields}>
          <div className={styles.from} data-testid="route-from">
            {swapped && destination ? <span className={styles.myLocation}>{destination.name}</span> : myLocation}
          </div>
          <form role="search" className={styles.toForm} onSubmit={handleSubmit}>
            <label htmlFor="drive-destination" className={styles.hidden}>
              도착지
            </label>
            {swapped && destination ? (
              <div className={styles.toStatic}>{myLocation}</div>
            ) : (
              <input
                id="drive-destination"
                type="search"
                className={styles.toInput}
                placeholder="도착지를 입력해주세요."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
              />
            )}
          </form>
        </div>
        {/* TODO: 경유지 추가 결과 화면 미정 (명세 '해당 결과 화면 아직 X') */}
        <button type="button" className={styles.add} aria-label="경유지 추가">
          +
        </button>
        <button type="button" className={styles.close} aria-label="닫기" onClick={() => navigate('/drive')}>
          <img src={icons.closeLarge} alt="" aria-hidden />
        </button>
      </div>

      {results === null ? (
        <>
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
              인기 드라이브 경로 BEST
            </h2>
            <div className={styles.popularList}>
              {popular.map((place) => (
                <PlaceCard key={place.id} place={place} onClick={(id) => navigate(`/drive/route/${id}`)} />
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
              <button type="button" className={styles.result} onClick={() => navigate(`/drive/route/${place.id}`)}>
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
    </div>
  )
}
