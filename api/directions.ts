/**
 * Vercel 서버리스 함수 — 카카오모빌리티 길찾기 프록시.
 * REST API 키(KAKAO_REST_API_KEY)는 서버 환경변수로만 두고 브라우저에 노출하지 않는다.
 * GET /api/directions?origin=위도,경도&destination=위도,경도
 */
import { handleDirectionsRequest } from '../src/lib/kakao/directions.js'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const { status, body } = await handleDirectionsRequest(searchParams, process.env.KAKAO_REST_API_KEY)
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}
