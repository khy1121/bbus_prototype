import type { ShareChannel } from '../components/ShareRecordSheet'

/** 웹 공유 인텐트 URL. 카카오톡/인스타그램은 SDK·앱 연동이 필요해 null */
export function buildShareIntentUrl(channel: ShareChannel, url: string, text: string): string | null {
  const u = encodeURIComponent(url)
  switch (channel) {
    case 'x':
      return `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(text)}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`
    default:
      return null
  }
}
