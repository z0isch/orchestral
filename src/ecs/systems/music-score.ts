import { query } from 'bitecs'
import { Player, Position, Enemy } from '../components'
import type { World } from '../world'
import { ScoreNote } from '../music-score'
import { resolveChord } from '../chords'

const aimAngle = (world: World, px: number, py: number, fallback: number): number => {
  let bestDist = Infinity
  let bestAngle = fallback
  for (const eid of query(world, [Enemy, Position])) {
    const dx = Position.x[eid]! - px
    const dy = Position.y[eid]! - py
    const dist = dx * dx + dy * dy
    if (dist < bestDist) {
      bestDist = dist
      bestAngle = Math.atan2(dy, dx)
    }
  }
  return bestAngle
}

const fireChord = (world: World, playerEid: number, notes: ScoreNote[]) => {
  if (notes.length === 0) return
  const px = Position.x[playerEid]!
  const py = Position.y[playerEid]!
  const angle = aimAngle(world, px, py, Player.facing[playerEid]!)
  world.attacks.pending.push(...resolveChord(notes, px, py, angle, world))
}

const randomCooldown = (note: ScoreNote) =>
  note.minCooldown + Math.floor(Math.random() * (note.maxCooldown - note.minCooldown + 1))

export const musicScoreSystem = (world: World) => {
  const { score, gamepad, time, metronome } = world
  const playerEid = query(world, [Player, Position])[0]

  // --- Accumulate hits into pending window, resolve when it closes ---
  if (score.pending !== null) {
    const alreadyHit = new Set(score.pending.hitNotes)
    const newlyHit = score.pending.notes.filter(
      n => gamepad.buttons[n.button] && !gamepad.prevButtons[n.button] && !alreadyHit.has(n)
    )
    for (const note of newlyHit) {
      score.hits += 1
      score.combo += 1
      score.points += 100 * score.combo
      score.noteCooldowns.set(note, { beat: metronome.beat, cooldown: randomCooldown(note) })
      if (note.durationSubBeats > 1) score.sustainedHolds.add(note)
    }
    if (newlyHit.length > 0) score.pending.hitNotes.push(...newlyHit)

    const allHit =
      score.pending.notes.length > 0 && score.pending.hitNotes.length === score.pending.notes.length
    if (allHit || time.elapsed > score.pending.deadline) {
      if (score.pending.notes.length > 0 && score.pending.hitNotes.length === 0) score.combo = 0
      if (playerEid !== undefined) {
        fireChord(world, playerEid, [...score.pending.hitNotes, ...score.pending.autoNotes])
      }
      score.pending = null
    }
  }

  // --- Sustained hold continuations (on exact sub-beat) ---
  if (metronome.isOnSubBeat) {
    const activeEntries = score.data.activeNotesAt(metronome.beat, metronome.subBeat)

    const continuationNotes: ScoreNote[] = []
    for (const { note, isStart } of activeEntries) {
      if (isStart) continue
      if (score.autoSustainedHolds.has(note)) {
        continuationNotes.push(note)
      } else if (score.sustainedHolds.has(note)) {
        if (!gamepad.buttons[note.button]) {
          score.sustainedHolds.delete(note)
          score.combo = 0
        } else {
          score.combo += 1
          score.points += 50 * score.combo
          continuationNotes.push(note)
        }
      }
    }

    if (playerEid !== undefined) fireChord(world, playerEid, continuationNotes)

    // Cleanup holds for notes no longer active
    const activeNotes = new Set(activeEntries.map(e => e.note))
    for (const note of score.sustainedHolds) {
      if (!activeNotes.has(note)) score.sustainedHolds.delete(note)
    }
    for (const note of score.autoSustainedHolds) {
      if (!activeNotes.has(note)) score.autoSustainedHolds.delete(note)
    }

    // Open new pending window for starting notes at this sub-beat
    openPendingWindow(score, activeEntries, metronome.subBeatIndex, metronome, time, score.graceS)
  } else if (score.pending === null && metronome.timeToNextSubBeat <= score.graceS) {
    // Lookahead: open window early for the upcoming sub-beat
    const nextAbsSub = metronome.nextSubBeatIndex
    const beat = Math.floor(nextAbsSub / metronome.subdivisions)
    const subBeat = nextAbsSub % metronome.subdivisions
    const activeEntries = score.data.activeNotesAt(beat, subBeat)
    openPendingWindow(
      score,
      activeEntries,
      nextAbsSub,
      metronome,
      time,
      metronome.timeToNextSubBeat + score.graceS
    )
  }
}

type Score = World['score']
type Met = World['metronome']
type Time = World['time']

const openPendingWindow = (
  score: Score,
  activeEntries: { note: ScoreNote; isStart: boolean }[],
  subBeatIndex: number,
  metronome: Met,
  time: Time,
  deadlineOffset: number
) => {
  if (score.lastOpenedSubBeatIndex === subBeatIndex) return

  const startingNotes = activeEntries.filter(e => e.isStart).map(e => e.note)
  if (startingNotes.length === 0) return

  score.active = startingNotes.filter(n => {
    const entry = score.noteCooldowns.get(n)
    return entry === undefined || metronome.beat - entry.beat >= entry.cooldown
  })
  const autoNotes = startingNotes.filter(n => !score.active.includes(n))
  for (const n of autoNotes) {
    if (n.durationSubBeats > 1) score.autoSustainedHolds.add(n)
  }
  score.pending = {
    notes: score.active,
    deadline: time.elapsed + deadlineOffset,
    hitNotes: [],
    autoNotes,
  }
  score.lastOpenedSubBeatIndex = subBeatIndex
}
