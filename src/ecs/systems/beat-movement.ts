import { query } from 'bitecs'
import { BeatMovement, Position, Velocity, Player } from '../components'
import type { World } from '../world'

export const beatMovementSystem = (world: World) => {
  const { metronome } = world
  const currentSub = metronome.subBeatIndex
  const playerEid = query(world, [Player, Position])[0]

  // Every frame: track player position for entities whose aim isn't locked yet
  for (const eid of query(world, [BeatMovement, Position])) {
    if (playerEid === undefined) break
    const moveEnd = BeatMovement.moveEndSubBeat[eid]!
    if (currentSub < moveEnd) continue // moving
    const cadence = BeatMovement.cadence[eid]!
    const subsSinceEnd = currentSub - BeatMovement.lastMoveEndSubBeat[eid]!
    const aimLead = BeatMovement.aimLeadSubBeats[eid]!
    if (subsSinceEnd < cadence - aimLead) {
      BeatMovement.targetX[eid] = Position.x[playerEid]!
      BeatMovement.targetY[eid] = Position.y[playerEid]!
    }
  }

  // Subbeat logic: stop movement, start movement
  if (!metronome.isOnSubBeat) return

  for (const eid of query(world, [BeatMovement, Velocity, Position])) {
    const moveEnd = BeatMovement.moveEndSubBeat[eid]!

    // Still moving — velocity already set
    if (currentSub < moveEnd) continue

    // Movement just finished — zero velocity
    if (currentSub === moveEnd && moveEnd > 0) {
      Velocity.x[eid] = 0
      Velocity.y[eid] = 0
      BeatMovement.lastMoveEndSubBeat[eid] = currentSub
      continue
    }

    // Check cadence
    const cadence = BeatMovement.cadence[eid]!
    const subsSinceEnd = currentSub - BeatMovement.lastMoveEndSubBeat[eid]!
    if (subsSinceEnd < cadence) continue

    // Start new move toward locked target
    const dx = BeatMovement.targetX[eid]! - Position.x[eid]!
    const dy = BeatMovement.targetY[eid]! - Position.y[eid]!
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) continue

    const overSubBeats = BeatMovement.overSubBeats[eid]!
    const speed = BeatMovement.distance[eid]! / (overSubBeats * metronome.subInterval)
    Velocity.x[eid] = (dx / dist) * speed
    Velocity.y[eid] = (dy / dist) * speed
    BeatMovement.moveEndSubBeat[eid] = currentSub + overSubBeats
  }
}
