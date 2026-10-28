/**
 * Vercel 서버리스 함수 — 경로 주변 휴게소 검색 (카카오 로컬 키워드 검색 프록시).
 * REST API 키(KAKAO_REST_API_KEY)는 서버 환경변수로만 두고 브라우저에 노출하지 않는다.
 * GET /api/rest-stops?points=위도,경도|위도,경도&radius=미터
 */
import { handleRestStopsRequest } from '../src/lib/kakao/restStops.js'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const { status, body } = await handleRestStopsRequest(searchParams, process.env.KAKAO_REST_API_KEY)
  // 휴게소 위치는 자주 바뀌지 않으므로 같은 요청은 CDN 에서 하루 재사용
  const cache = status === 200 ? 'public, s-maxage=86400' : 'no-store'
  return Response.json(body, { status, headers: { 'Cache-Control': cache } })
}
