import { useNavigate } from 'react-router-dom'
import { getRecordShareUrl } from './api'
import type { ShareChannel } from './components/ShareRecordSheet'
import type { DriveRecord } from './types'
import { buildShareIntentUrl } from './utils/share'

/** 공유 채널별 동작 */
export function useShareRecord() {
  const navigate = useNavigate()

  return (record: DriveRecord, channel: ShareChannel) => {
    const url = getRecordShareUrl(record.id)
    if (channel === 'instagram') {
      // 인스타그램 스토리용 미리보기 화면 (Figma 10:15650)
      navigate(`/map/cards/${record.id}/story`)
      return
    }
    const intent = buildShareIntentUrl(channel, url, record.title)
    if (intent) {
      window.open(intent, '_blank', 'noopener,noreferrer')
      return
    }
    // TODO(kakao): 카카오 JS SDK(Kakao.Share.sendDefault) 연동. 그 전까지는 기기 공유 시트로 대체
    if (navigator.share) {
      void navigator.share({ title: record.title, url }).catch(() => {})
    } else {
      void navigator.clipboard?.writeText(url).catch(() => {})
    }
  }
}
