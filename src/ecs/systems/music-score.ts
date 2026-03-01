import { query } from 'bitecs'
import { Player, Position, Enemy } from '../components'
import type { World } from '../world'
import { ScoreNote } from '../music-score'

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

  // Each frame: resolve any open pending note
  if (score.pending !== null) {
    const hitNotes = score.pending.notes.filter(n => gamepad.buttons[n.button])
    if (hitNotes.length > 0) {
      score.result = { hit: true, timestamp: time.elapsed }
      score.hits += hitNotes.length
      for (const note of hitNotes) {
        score.combo += 1
        score.points += 100 * score.combo
        score.noteCooldowns.set(note, {
          beat: metronome.beat,
          cooldown: getRandomCooldown(note),
        })
        if (playerEid !== undefined) {
          const px = Position.x[playerEid]!
          const py = Position.y[playerEid]!
          world.attacks.pending.push({
            type: note.attackType,
            x: px,
            y: py,
            angle: aimAngle(world, px, py, Player.facing[playerEid]!),
          })
        }
      }
      score.pending = null
    } else if (time.elapsed > score.pending.deadline) {
      score.combo = 0
      score.pending = null
    }
  }

  if (!metronome.isOnSubBeat) return
  const allActive = score.data.notesAt(metronome.beat, metronome.subBeat)
  score.active = allActive.filter(n => {
    const entry = score.noteCooldowns.get(n)
    return entry === undefined || metronome.beat - entry.beat >= entry.cooldown
  })
  if (score.active.length > 0) {
    score.pending = { notes: score.active, deadline: time.elapsed + GRACE_S }
  }

  // Auto-attack: notes on cooldown fire automatically each time their beat comes around
  if (playerEid !== undefined) {
    for (const note of allActive) {
      if (score.active.includes(note)) continue
      const px = Position.x[playerEid]!
      const py = Position.y[playerEid]!
      world.attacks.pending.push({
        type: note.attackType,
        x: px,
        y: py,
        angle: aimAngle(world, px, py, Player.facing[playerEid]!),
      })
    }
  }
}
