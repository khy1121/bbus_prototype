import driverAvatar from '../assets/character-driver.webp'
import passengerAvatar from '../assets/character-passenger.webp'
import styles from './RecordDetail.module.scss'

const ROLE = {
  driver: { label: '운전자', avatar: driverAvatar },
  passenger: { label: '동승자', avatar: passengerAvatar },
} as const

/** 운전자/동승자 한 줄 문구 (Figma 10:15551) — 명조체 */
export function RecordMessage({ role, message }: { role: keyof typeof ROLE; message: string }) {
  const { label, avatar } = ROLE[role]
  return (
    <section className={styles.message}>
      <p className={styles.messageRole}>
        <img src={avatar} alt="" aria-hidden />
        {label}
      </p>
      <p className={styles.messageText}>{message}</p>
    </section>
  )
}
