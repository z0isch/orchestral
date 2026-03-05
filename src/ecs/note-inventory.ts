import type { EditorAttackTag, NoteDuration } from '../score-editor/types'

export type InventoryNote = {
  attackTag: EditorAttackTag
  duration: NoteDuration
  count: number
}

export const DEFAULT_NOTE_INVENTORY: InventoryNote[] = [
  { attackTag: 'lightning', duration: 1, count: 4 },
  { attackTag: 'lightning', duration: 2, count: 2 },
  { attackTag: 'lightning', duration: 4, count: 1 },
  { attackTag: 'projectile', duration: 1, count: 4 },
  { attackTag: 'projectile', duration: 2, count: 2 },
  { attackTag: 'projectile', duration: 4, count: 1 },
  { attackTag: 'cloud', duration: 1, count: 4 },
  { attackTag: 'cloud', duration: 2, count: 2 },
  { attackTag: 'cloud', duration: 4, count: 1 },
  { attackTag: 'explosion', duration: 1, count: 4 },
  { attackTag: 'explosion', duration: 2, count: 2 },
  { attackTag: 'explosion', duration: 4, count: 1 },
]
