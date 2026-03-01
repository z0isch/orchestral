import { query } from 'bitecs'
import { BeatMovement, Position, Velocity, Player } from '../components'
import type { World } from '../world'

const LURCH_FRACTION = 0.4

export const beatMovementSystem = (world: World) => {
  const { metronome } = world

  if (!metronome.isOnBeat) {
    if (metronome.beatPhase > LURCH_FRACTION) {
      for (const eid of query(world, [BeatMovement, Velocity])) {
        Velocity.x[eid] = 0
        Velocity.y[eid] = 0
      }
    }
    return
  }

  const playerEid = query(world, [Player, Position])[0]
  if (playerEid === undefined) return

  const px = Position.x[playerEid]!
  const py = Position.y[playerEid]!

  for (const eid of query(world, [BeatMovement, Velocity, Position])) {
    const dx = px - Position.x[eid]!
    const dy = py - Position.y[eid]!
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) continue
    const speed = BeatMovement.distance[eid]! / (world.metronome.interval * LURCH_FRACTION)
    Velocity.x[eid] = (dx / dist) * speed
    Velocity.y[eid] = (dy / dist) * speed
  }
}
