import type { AttackType } from './components'

export type ScoreNote = {
  /** Beat within the loop (0-indexed) */
  beat: number
  /** Sub-beat within the beat (0-indexed, up to subdivisions-1) */
  subBeat: number
  /** How many sub-beats this note is held (1 = quarter, 2 = half, 4 = whole) */
  durationSubBeats: number
  /** Gamepad button index expected at this position */
  button: number
  minAutoRepeats: number
  maxAutoRepeats: number
  attackType: AttackType
}

export class MusicScore {
  readonly notes: ScoreNote[]
  /** How many beats the pattern spans before looping */
  readonly loopBeats: number
  /** How many silent beats to wait before the loop begins */
  readonly introBeats: number

  constructor(loopBeats: number, notes: ScoreNote[], introBeats = 0) {
    this.loopBeats = loopBeats
    this.notes = notes
    this.introBeats = introBeats
  }

  /** Returns all notes scheduled at the given absolute beat + sub-beat position */
  notesAt(absoluteBeat: number, subBeat: number): ScoreNote[] {
    if (absoluteBeat < this.introBeats) return []
    const beat = (absoluteBeat - this.introBeats) % this.loopBeats
    return this.notes.filter(n => n.beat === beat && n.subBeat === subBeat)
  }

  /**
   * Returns all notes whose duration span covers the given absolute beat + sub-beat position.
   * Wraps correctly over the loop boundary (loopBeats * 4 total sub-beats).
   */
  activeNotesAt(
    absoluteBeat: number,
    subBeat: number
  ): { note: ScoreNote; isStart: boolean; subBeatIndex: number }[] {
    if (absoluteBeat < this.introBeats) return []
    const totalSubBeats = this.loopBeats * 4
    const loopBeat = (absoluteBeat - this.introBeats) % this.loopBeats
    const currentPos = loopBeat * 4 + subBeat

    return this.notes.flatMap(note => {
      const startPos = note.beat * 4 + note.subBeat
      for (let i = 0; i < note.durationSubBeats; i++) {
        const pos = (startPos + i) % totalSubBeats
        if (pos === currentPos) {
          return [{ note, isStart: i === 0, subBeatIndex: i }]
        }
      }
      return []
    })
  }
}
