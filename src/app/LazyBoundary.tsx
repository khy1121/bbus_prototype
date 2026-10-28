import { Suspense, type ReactNode } from 'react'
import styles from './LazyBoundary.module.scss'

/** 지연 로딩되는 화면 코드가 도착하기 전 잠깐 보이는 빈 화면 */
export function LazyBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className={styles.fallback} aria-busy="true" />}>{children}</Suspense>
}
