export type EditorAttackTag = 'lightning' | 'projectile' | 'cloud' | 'explosion'
export type NoteDuration = 1 | 2 | 4 // quarter, half, whole

export type PlacedNote = {
  id: string
  attackTag: EditorAttackTag
  duration: NoteDuration
  startSlot: number // 0-15 (4 measures x 4 slots)
  line: number // 0-3 (one per attack type)
}

export type InventoryNote = {
  attackTag: EditorAttackTag
  duration: NoteDuration
  count: number
}

export type EditorAction =
  | { tag: 'place'; note: PlacedNote }
  | { tag: 'remove'; noteId: string }
  | { tag: 'load'; placedNotes: PlacedNote[]; inventory: InventoryNote[] }

export const BUTTON_COLORS = ['#33cc33', '#dd3333', '#dddd00', '#3366dd'] as const
export const BUTTON_LABELS = ['←', '↓', '↑', '→'] as const

const ATTACK_NAMES = ['Lightning', 'Projectile', 'Cloud', 'Explosion'] as const

export const LINE_CONFIG = [
  { line: 0, attackTag: 'lightning' as const, label: `${BUTTON_LABELS[0]} ${ATTACK_NAMES[0]}`, color: BUTTON_COLORS[0] },
  { line: 1, attackTag: 'projectile' as const, label: `${BUTTON_LABELS[1]} ${ATTACK_NAMES[1]}`, color: BUTTON_COLORS[1] },
  { line: 2, attackTag: 'cloud' as const, label: `${BUTTON_LABELS[2]} ${ATTACK_NAMES[2]}`, color: BUTTON_COLORS[2] },
  { line: 3, attackTag: 'explosion' as const, label: `${BUTTON_LABELS[3]} ${ATTACK_NAMES[3]}`, color: BUTTON_COLORS[3] },
] as const

export const TOTAL_SLOTS = 16
export const SLOTS_PER_MEASURE = 4

export const DURATION_ICONS: Record<NoteDuration, string> = {
  1: '♩',
  2: '𝅗𝅥',
  4: '𝅝',
}
