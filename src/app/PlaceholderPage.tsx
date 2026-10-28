import { EmptyState } from '@/components'

/** 이번 범위 밖 화면 (스튜디오/마이) */
export function PlaceholderPage({ title }: { title: string }) {
  return <EmptyState title={title} description={'아직 준비 중인 화면이에요.\n곧 만나요!'} />
}
