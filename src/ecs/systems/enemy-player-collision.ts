import { query, removeEntity } from 'bitecs'
import { Position, Player, Enemy, Dash, PLAYER_RADIUS } from '../components'
import type { World } from '../world'

export const ENEMY_RADIUS = 20
const HIT_DIST_SQ = (ENEMY_RADIUS + PLAYER_RADIUS) ** 2

export const enemyPlayerCollisionSystem = (world: World) => {
  const playerEid = query(world, [Player, Position])[0]
  if (playerEid === undefined) return
  if (Dash.remaining[playerEid]! > 0) return

  const px = Position.x[playerEid]!
  const py = Position.y[playerEid]!
  const currentBeat = world.metronome.beat + world.metronome.beatPhase

  for (const eid of query(world, [Enemy, Position])) {
    const dx = Position.x[eid]! - px
    const dy = Position.y[eid]! - py
    if (dx * dx + dy * dy < HIT_DIST_SQ) {
      removeEntity(world, eid)
      if (currentBeat >= world.player.invincibleUntilBeat) {
        world.player.health = Math.max(0, world.player.health - 1)
        world.player.invincibleUntilBeat = currentBeat + 2
      }
    }
  }
}
