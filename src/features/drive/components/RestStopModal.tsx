import { icons, images } from '../assets'
import type { RestStop } from '../types'
import { DriveDialog } from './DriveDialog'
import styles from './RestStopModal.module.scss'

type RestStopModalProps = {
  restStop: RestStop | null
  acquired: boolean
  onClose: () => void
}

const MAX_MENUS = 4

/** 05 휴게소 상세 팝업 (Figma 10:10277) */
export function RestStopModal({ restStop, acquired, onClose }: RestStopModalProps) {
  if (!restStop) return null
  const stampImage = acquired ? (restStop.stampColor === 'pink' ? images.stampPink : images.stamp) : images.stampLocked

  return (
    <DriveDialog open onClose={onClose} label={restStop.name}>
      <div className={styles.content}>
        <span className={styles.highway}>
          <img src={icons.pinCoral} alt="" aria-hidden />
          {restStop.highway}
        </span>
        <div className={styles.head}>
          <div className={styles.texts}>
            <h2 className={styles.name}>{restStop.name}</h2>
            <p className={styles.description}>{restStop.description}</p>
          </div>
          <img className={styles.stamp} src={stampImage} alt={acquired ? '스탬프 획득' : '스탬프 미획득'} />
        </div>

        <h3 className={styles.menuTitle}>이 곳의 대표 메뉴</h3>
        <ul className={styles.menus}>
          {restStop.menus.slice(0, MAX_MENUS).map((menu) => (
            <li key={menu.name} className={styles.menu}>
              <img src={menu.image} alt="" aria-hidden className={styles.menuImage} />
              <div className={styles.menuInfo}>
                <p className={styles.menuName}>{menu.name}</p>
                <p className={styles.menuDesc}>{menu.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DriveDialog>
  )
}
