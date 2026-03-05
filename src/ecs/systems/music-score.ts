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

export const GRACE_S = 0.1
const getRandomCooldown = (note: ScoreNote) =>
  note.maxCooldown + Math.floor(Math.random() * (note.maxCooldown - note.minCoolodown))

export const musicScoreSystem = (world: World) => {
  const { score, gamepad, time, metronome } = world
  const playerEid = query(world, [Player, Position])[0]

  // Each frame: accumulate hits into the pending window, resolve when window closes
  if (score.pending !== null) {
    const alreadyHit = new Set(score.pending.hitNotes)
    const newlyHit = score.pending.notes.filter(
      n => gamepad.buttons[n.button] && !alreadyHit.has(n)
    )

    if (newlyHit.length > 0) {
      score.result = { hit: true, timestamp: time.elapsed }
      score.hits += newlyHit.length
      for (const note of newlyHit) {
        score.combo += 1
        score.points += 100 * score.combo
        score.noteCooldowns.set(note, {
          beat: metronome.beat,
          cooldown: getRandomCooldown(note),
        })
        // Register sustained holds for notes with duration > 1
        if (note.durationSubBeats > 1) {
          score.sustainedHolds.add(note)
        }
      }
      score.pending.hitNotes.push(...newlyHit)
    }

    const allPlayerNotesHit =
      score.pending.notes.length > 0 && score.pending.hitNotes.length === score.pending.notes.length
    const deadlinePassed = time.elapsed > score.pending.deadline

    if (allPlayerNotesHit || deadlinePassed) {
      const playerMissed = score.pending.notes.length > 0 && score.pending.hitNotes.length === 0
      if (playerMissed) score.combo = 0
      if (playerEid !== undefined) {
        const px = Position.x[playerEid]!
        const py = Position.y[playerEid]!
        const angle = aimAngle(world, px, py, Player.facing[playerEid]!)
        const allNotes = [...score.pending.hitNotes, ...score.pending.autoNotes]
        world.attacks.pending.push(...resolveChord(allNotes, px, py, angle, world))
      }
      score.pending = null
    }
  }

  if (!metronome.isOnSubBeat) return

  // --- Split active entries in a single pass ---
  const activeEntries = score.data.activeNotesAt(metronome.beat, metronome.subBeat)
  const continuations: typeof activeEntries = []
  const startingNotes: ScoreNote[] = []
  for (const entry of activeEntries) {
    if (entry.isStart) startingNotes.push(entry.note)
    else continuations.push(entry)
  }

  // --- Process continuation sub-beats for sustained holds ---
  const continuationNotes: ScoreNote[] = []
  for (const { note } of continuations) {
    if (!score.sustainedHolds.has(note)) continue

    if (!gamepad.buttons[note.button]) {
      // Player released early — break combo, remove hold
      score.sustainedHolds.delete(note)
      score.combo = 0
    } else {
      // Still held — award points
      score.combo += 1
      score.points += 50 * score.combo
      continuationNotes.push(note)
    }
  }

  // Fire chord-resolved attacks for continuation notes
  if (continuationNotes.length > 0 && playerEid !== undefined) {
    const px = Position.x[playerEid]!
    const py = Position.y[playerEid]!
    const angle = aimAngle(world, px, py, Player.facing[playerEid]!)
    world.attacks.pending.push(...resolveChord(continuationNotes, px, py, angle, world))
  }

  // Cleanup: remove holds for notes no longer active
  const activeNoteSet = new Set(activeEntries.map(e => e.note))
  for (const note of score.sustainedHolds) {
    if (!activeNoteSet.has(note)) {
      score.sustainedHolds.delete(note)
    }
  }

  score.active = startingNotes.filter(n => {
    const entry = score.noteCooldowns.get(n)
    return entry === undefined || metronome.beat - entry.beat >= entry.cooldown
  })
  if (startingNotes.length > 0) {
    const autoNotes = startingNotes.filter(n => !score.active.includes(n))
    score.pending = {
      notes: score.active,
      deadline: time.elapsed + GRACE_S,
      hitNotes: [],
      autoNotes,
    }
  }
}
