import { create } from 'zustand'

/**
 * 로그인 사용자/커플 정보.
 * TODO(backend): 로그인·커플 연동 API 연결 후 서버 값으로 대체. 현재는 목업 값.
 */
type UserState = {
  userName: string
  partnerName: string
  /** 붕붕이(캐릭터/차량) 이름 */
  carName: string
  /** 커플 연동일 (D+일수 계산 기준) */
  coupleSince: string
  partnerLinked: boolean
}

export const useUserStore = create<UserState>(() => ({
  userName: '민준',
  partnerName: '민지',
  carName: '붕붕이',
  coupleSince: '2026-10-06',
  partnerLinked: true,
}))

/** 연동일 포함 D+일수 (연동 당일 = D+1) */
export function daysSince(isoDate: string, now: Date = new Date()): number {
  const start = new Date(`${isoDate}T00:00:00`)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1
}
