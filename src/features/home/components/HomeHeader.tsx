import bell from '../assets/bell.svg'
import dotRed from '../assets/dot-red.svg'
import styles from './HomeHeader.module.scss'

type HomeHeaderProps = {
  today: Date
  userName: string
  hasUnread: boolean
  onBellClick: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 홈 상단: 오늘 날짜, 알림 버튼, 인사말 (최신 디자인 Figma 10:15754) */
export function HomeHeader({ today, userName, hasUnread, onBellClick }: HomeHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <time
          className={styles.date}
          dateTime={`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`}
        >
          {`${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`}
        </time>
        <button
          type="button"
          className={styles.bell}
          aria-label={hasUnread ? '알림 (읽지 않은 알림 있음)' : '알림'}
          onClick={onBellClick}
        >
          <img src={bell} alt="" />
          {hasUnread && <img src={dotRed} alt="" className={styles.dot} data-testid="unread-dot" />}
        </button>
      </div>
      <div className={styles.greeting}>
        <p className={styles.hello}>{`안녕하세요, ${userName}님! 👋🏻`}</p>
        <h1 className={styles.title}>오늘은 어디로 떠나볼까요?</h1>
      </div>
    </header>
  )
}
