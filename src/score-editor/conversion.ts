import type { AttackType } from '../ecs/components'
import { ScoreNote } from '../ecs/music-score'
import { EditorAttackTag, LINE_CONFIG, PlacedNote, SLOTS_PER_MEASURE, TOTAL_SLOTS } from './types'

export function slotToBeatSubBeat(slot: number): { beat: number; subBeat: number } {
  return { beat: Math.floor(slot / SLOTS_PER_MEASURE), subBeat: slot % SLOTS_PER_MEASURE }
}

const DEFAULT_ATTACK_PARAMS: Record<EditorAttackTag, AttackType> = {
  lightning: { tag: 'lightning', damage: 20 },
  projectile: { tag: 'projectile', speed: 400, radius: 3, damage: 10 },
  cloud: { tag: 'cloud', radius: 120, subBeatDuration: 12, damage: 20 },
  explosion: { tag: 'explosion', radius: 200, damage: 10 },
}

const ATTACK_TAG_TO_BUTTON = Object.fromEntries(
  LINE_CONFIG.map(c => [c.attackTag, c.line])
) as Record<EditorAttackTag, number>

const BUTTON_TO_ATTACK_TAG = Object.fromEntries(
  LINE_CONFIG.map(c => [c.line, c.attackTag])
) as Record<number, EditorAttackTag>

export function editorStateToScoreNotes(placedNotes: PlacedNote[]): ScoreNote[] {
  return placedNotes.map(note => {
    const { beat, subBeat } = slotToBeatSubBeat(note.startSlot)
    return {
      beat,
      subBeat,
      durationSubBeats: note.duration,
      button: ATTACK_TAG_TO_BUTTON[note.attackTag],
      minCooldown: 0,
      maxCooldown: 0,
      attackType: DEFAULT_ATTACK_PARAMS[note.attackTag],
    }
  })
}

export function scoreNotesToPlacedNotes(notes: ScoreNote[]): PlacedNote[] {
  return notes.flatMap((note, i) => {
    const attackTag = BUTTON_TO_ATTACK_TAG[note.button]
    if (attackTag == null) return []
    const startSlot = note.beat * SLOTS_PER_MEASURE + note.subBeat
    if (startSlot >= TOTAL_SLOTS) return []
    return [
      {
        id: `loaded-${i}-${note.beat}-${note.subBeat}`,
        attackTag,
        duration: (note.durationSubBeats >= 4 ? 4 : note.durationSubBeats >= 2 ? 2 : 1) as
          | 1
          | 2
          | 4,
        startSlot,
        line: note.button,
      },
    ]
  })
}
