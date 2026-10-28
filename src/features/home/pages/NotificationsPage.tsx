import { useEffect, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { EmptyState, TopBar } from '@/components'
import { useHomeStore } from '../homeStore'
import type { HomeNotification } from '../types'
import { formatRelativeTime, groupNotifications } from '../utils/time'
import styles from './NotificationsPage.module.scss'

function NotificationList({
  label,
  items,
  onSelect,
}: {
  label: string
  items: HomeNotification[]
  onSelect: (n: HomeNotification) => void
}) {
  const id = useId()
  if (items.length === 0) return null
  return (
    <section className={styles.group}>
      <h2 id={id} className={styles.groupTitle}>
        {label}
      </h2>
      <ul aria-labelledby={id} className={styles.list}>
        {items.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className={clsx(styles.item, !n.read && styles.unread)}
              data-unread={!n.read}
              onClick={() => onSelect(n)}
            >
              <span className={styles.row}>
                <span className={styles.title}>{n.title}</span>
                <span className={styles.time}>{formatRelativeTime(n.receivedAt)}</span>
              </span>
              <span className={styles.description}>{n.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** 알림 목록 — 기능명세서(홈) 3️⃣ (Figma 10:6295) */
export function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, loadNotifications, markRead } = useHomeStore()

  useEffect(() => {
    if (notifications === null) void loadNotifications()
  }, [notifications, loadNotifications])

  const { recent7, recent30 } = groupNotifications(notifications ?? [])

  const handleSelect = (n: HomeNotification) => {
    markRead(n.id)
    navigate(`/places/${n.placeId}`)
  }

  return (
    <div className={styles.page}>
      <TopBar title="알림" onBack={() => navigate(-1)} />
      <div className={styles.body}>
        {notifications !== null && recent7.length + recent30.length === 0 ? (
          <EmptyState title="아직 받은 알림이 없어요" description={'연인이 드라이브 장소를 공유하면\n여기에서 알려드릴게요.'} />
        ) : (
          <>
            <NotificationList label="최근 7일" items={recent7} onSelect={handleSelect} />
            <NotificationList label="최근 30일" items={recent30} onSelect={handleSelect} />
          </>
        )}
      </div>
    </div>
  )
}
