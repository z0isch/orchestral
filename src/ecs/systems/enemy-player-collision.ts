import { query, hasComponent } from 'bitecs'
import { Position, Player, Enemy, Dash, Swarmer, PLAYER_RADIUS, ENEMY_RADIUS, SWARMER_RADIUS } from '../components'
import type { World } from '../world'

export const enemyPlayerCollisionSystem = (world: World) => {
  const playerEid = query(world, [Player, Position])[0]
  if (playerEid === undefined) return
  if (Dash.remaining[playerEid]! > 0) return

  const px = Position.x[playerEid]!
  const py = Position.y[playerEid]!
  const currentBeat = world.metronome.beat + world.metronome.beatPhase

  for (const eid of query(world, [Enemy, Position])) {
    const eRadius = hasComponent(world, eid, Swarmer) ? SWARMER_RADIUS : ENEMY_RADIUS
    const hitDistSq = (eRadius + PLAYER_RADIUS) ** 2
    const dx = Position.x[eid]! - px
    const dy = Position.y[eid]! - py
    if (dx * dx + dy * dy < hitDistSq) {
      if (currentBeat >= world.player.invincibleUntilBeat) {
        world.player.health = Math.max(0, world.player.health - 1)
        world.player.invincibleUntilBeat = currentBeat + 2
      }
    }
  }
}
