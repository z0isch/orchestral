export type ScoreNote = {
  /** Beat within the loop (0-indexed) */
  beat: number
  /** Sub-beat within the beat (0-indexed, up to subdivisions-1) */
  subBeat: number
  /** Gamepad button index expected at this position */
  button: number
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
}
