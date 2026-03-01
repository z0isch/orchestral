import { query, removeEntity } from 'bitecs'
import { Position, Projectile, Enemy } from '../components'
import type { World } from '../world'

const ENEMY_RADIUS = 20
const PROJECTILE_RADIUS = 6
const HIT_DIST_SQ = (ENEMY_RADIUS + PROJECTILE_RADIUS) ** 2

export const collisionSystem = (world: World) => {
  const projectiles = query(world, [Position, Projectile])
  const enemies = query(world, [Position, Enemy])

  for (const eeid of enemies) {
    const ex = Position.x[eeid]!
    const ey = Position.y[eeid]!
    for (const peid of projectiles) {
      const dx = Position.x[peid]! - ex
      const dy = Position.y[peid]! - ey
      if (dx * dx + dy * dy < HIT_DIST_SQ) {
        removeEntity(world, eeid)
        break
      }
    }
  }
}
