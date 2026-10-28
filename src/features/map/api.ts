import { mockRecords } from './mocks'
import type { DriveRecord } from './types'

const SHARE_BASE_URL = 'https://bunbungus.app'

// 목업 저장소 (삭제 반영용)
let records: DriveRecord[] = [...mockRecords]

/** 테스트에서 목업 상태 초기화 */
export function __resetMockRecords() {
  records = [...mockRecords]
}

/** 드라이브 기록 목록 (최신순) */
export async function fetchDriveRecords(): Promise<DriveRecord[]> {
  // TODO(backend): GET /couples/me/drive-records
  return [...records].sort((a, b) => b.date.localeCompare(a.date))
}

export async function fetchDriveRecord(id: string): Promise<DriveRecord | null> {
  // TODO(backend): GET /couples/me/drive-records/:id
  return records.find((r) => r.id === id) ?? null
}

export async function deleteDriveRecord(id: string): Promise<void> {
  // TODO(backend): DELETE /couples/me/drive-records/:id
  records = records.filter((r) => r.id !== id)
}

/** 공유 링크 (Figma: https://bunbungus.app/drivemap) */
export function getRecordShareUrl(id?: string): string {
  // TODO(backend): 서버에서 발급한 공유 링크로 교체
  return id ? `${SHARE_BASE_URL}/drivemap/${id}` : `${SHARE_BASE_URL}/drivemap`
}
