/**
 * 카카오 로컬 키워드 검색으로 경로 주변 휴게소 찾기 — 요청 URL 생성·필터·프록시 처리.
 * 서버(Vercel 함수 / Vite 개발 서버)에서만 호출한다. REST API 키는 브라우저에 노출하면 안 된다.
 * https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword
 */

// 서버(Node ESM)에서도 import 하므로 다른 모듈에 의존하지 않는다
type LatLng = { lat: number; lng: number }

export const KEYWORD_ENDPOINT = 'https://dapi.kakao.com/v2/local/search/keyword.json'

/** 한 번에 받을 검색 지점 수 상한 (요청 폭주 방지) */
export const MAX_POINTS = 60
/** 지점당 최대 페이지 (카카오 키워드 검색은 페이지당 15개) */
const MAX_PAGES = 3
const DEFAULT_RADIUS_M = 8000
const MAX_RADIUS_M = 20000
/** 카카오 동시 요청 수 */
const CONCURRENCY = 6

export type RestStopPlace = { id: string; name: string; highway: string; position: LatLng }

type KakaoPlace = {
  id: string
  place_name: string
  category_name: string
  x: string
  y: string
  road_address_name?: string
  address_name?: string
}
type KeywordResponse = { documents?: KakaoPlace[]; meta?: { is_end?: boolean } }

export function buildRestStopSearchUrl(point: LatLng, radiusM: number, page: number): string {
  const url = new URL(KEYWORD_ENDPOINT)
  url.searchParams.set('query', '휴게소')
  url.searchParams.set('x', String(point.lng))
  url.searchParams.set('y', String(point.lat))
  url.searchParams.set('radius', String(radiusM))
  url.searchParams.set('sort', 'distance')
  url.searchParams.set('size', '15')
  url.searchParams.set('page', String(page))
  return url.toString()
}

/** "위도,경도|위도,경도" → 좌표 목록. 형식·범위가 틀리거나 너무 많으면 null */
export function parsePointsParam(value: string | null): LatLng[] | null {
  if (!value) return null
  const parts = value.split('|')
  if (parts.length > MAX_POINTS) return null
  const points: LatLng[] = []
  for (const part of parts) {
    const [lat, lng] = part.split(',').map(Number)
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
    points.push({ lat, lng })
  }
  return points
}

/** 휴게소 자체만 — 휴게소 안의 식당·카페·주유소, 졸음쉼터는 제외 */
export function isRestStopPlace(place: Pick<KakaoPlace, 'place_name' | 'category_name'>): boolean {
  const category = place.category_name ?? ''
  if (/졸음쉼터|주유|충전/.test(category) || /졸음쉼터/.test(place.place_name)) return false
  const leaf = category.split('>').pop()?.trim() ?? ''
  return category.includes('휴게소') && leaf.includes('휴게소')
}

/** 도로명 주소에서 고속도로 이름 ('경기 용인시 기흥구 경부고속도로 409' → '경부고속도로') */
function highwayOf(place: KakaoPlace): string {
  const match = `${place.road_address_name ?? ''} ${place.address_name ?? ''}`.match(/(\S+고속도로)/)
  return match?.[1] ?? ''
}

async function searchAround(
  point: LatLng,
  radiusM: number,
  restApiKey: string,
  fetchImpl: typeof fetch,
): Promise<KakaoPlace[]> {
  const found: KakaoPlace[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetchImpl(buildRestStopSearchUrl(point, radiusM, page), {
      headers: { Authorization: `KakaoAK ${restApiKey}` },
    })
    if (!res.ok) throw new Error(`카카오 로컬 응답 오류 (${res.status})`)
    const json = (await res.json()) as KeywordResponse
    found.push(...(json.documents ?? []))
    if (json.meta?.is_end !== false) break
  }
  return found
}

/** 작업을 최대 limit 개씩 동시에 실행 (순서 유지) */
async function mapLimited<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

/**
 * 프록시 공통 처리 — Vercel 함수와 Vite 개발 서버 미들웨어가 함께 쓴다.
 * GET ?points=위도,경도|…&radius=미터 → { places: RestStopPlace[] } (경로 위 여부는 클라이언트가 판단)
 */
export async function handleRestStopsRequest(
  search: URLSearchParams,
  restApiKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<{ status: number; body: unknown }> {
  if (!restApiKey) return { status: 503, body: { error: 'KAKAO_REST_API_KEY 가 설정되지 않았습니다.' } }
  const points = parsePointsParam(search.get('points'))
  if (!points) return { status: 400, body: { error: `points 는 "위도,경도|…" 형식, 최대 ${MAX_POINTS}개예요.` } }
  const radius = Math.min(Math.max(Number(search.get('radius')) || DEFAULT_RADIUS_M, 500), MAX_RADIUS_M)

  try {
    const pages = await mapLimited(points, CONCURRENCY, (p) => searchAround(p, radius, restApiKey, fetchImpl))
    const seen = new Set<string>()
    const places: RestStopPlace[] = []
    for (const place of pages.flat()) {
      if (seen.has(place.id) || !isRestStopPlace(place)) continue
      seen.add(place.id)
      places.push({
        id: place.id,
        name: place.place_name,
        highway: highwayOf(place),
        position: { lat: Number(place.y), lng: Number(place.x) },
      })
    }
    return { status: 200, body: { places } }
  } catch (e) {
    return { status: 502, body: { error: e instanceof Error ? e.message : '휴게소 검색 실패' } }
  }
}
