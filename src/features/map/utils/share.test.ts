import { buildShareIntentUrl } from './share'

describe('buildShareIntentUrl', () => {
  it('X 공유 인텐트 URL', () => {
    const url = buildShareIntentUrl('x', 'https://bunbungus.app/drivemap/r01', '우리의 첫 바다 드라이브')
    expect(url).toBe(
      'https://twitter.com/intent/tweet?url=https%3A%2F%2Fbunbungus.app%2Fdrivemap%2Fr01&text=%EC%9A%B0%EB%A6%AC%EC%9D%98%20%EC%B2%AB%20%EB%B0%94%EB%8B%A4%20%EB%93%9C%EB%9D%BC%EC%9D%B4%EB%B8%8C',
    )
  })

  it('페이스북 공유 URL', () => {
    expect(buildShareIntentUrl('facebook', 'https://a.b/c', 't')).toBe(
      'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fa.b%2Fc',
    )
  })

  it('지원하지 않는 채널은 null', () => {
    expect(buildShareIntentUrl('kakao', 'u', 't')).toBeNull()
  })
})
