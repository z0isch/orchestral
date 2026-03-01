import type { World } from '../world'

const GRACE_S = 0.1
const getRandomCooldown = () => 20 + Math.floor(Math.random() * 13)

export const musicScoreSystem = (world: World) => {
  const { score, gamepad, time, metronome } = world

  // Each frame: resolve any open pending note
  if (score.pending !== null) {
    const hitNotes = score.pending.notes.filter(n => gamepad.buttons[n.button])
    if (hitNotes.length > 0) {
      score.result = { hit: true, timestamp: time.elapsed }
      score.hits += hitNotes.length
      for (const note of hitNotes) {
        score.noteCooldowns.set(note, { beat: metronome.beat, cooldown: getRandomCooldown() })
      }
      score.pending = null
    } else if (time.elapsed > score.pending.deadline) {
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
}
