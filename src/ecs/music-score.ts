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

  constructor(loopBeats: number, notes: ScoreNote[]) {
    this.loopBeats = loopBeats
    this.notes = notes
  }

  /** Returns all notes scheduled at the given absolute beat + sub-beat position */
  notesAt(absoluteBeat: number, subBeat: number): ScoreNote[] {
    const beat = absoluteBeat % this.loopBeats
    return this.notes.filter(n => n.beat === beat && n.subBeat === subBeat)
  }
}
