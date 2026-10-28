import { useCallback, useEffect, useState } from 'react'
import { fetchDriveRecord, fetchDriveRecords } from './api'
import type { DriveRecord } from './types'

export function useDriveRecords() {
  const [records, setRecords] = useState<DriveRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetchDriveRecords().then((data) => {
      if (!alive) return
      setRecords(data)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  return { records, loading }
}

export function useDriveRecord(id: string | undefined) {
  const [record, setRecord] = useState<DriveRecord | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (!id) return
    setLoading(true)
    fetchDriveRecord(id).then((data) => {
      setRecord(data)
      setLoading(false)
    })
  }, [id])

  useEffect(load, [load])

  return { record, loading }
}

/** 오늘 날짜 YYYY-MM-DD (로컬 기준) */
export function todayIso(now: Date = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${m}-${d}`
}
