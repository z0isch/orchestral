import { query, removeEntity } from 'bitecs'
import { Position, Projectile, Enemy, Explosion, Player, Health, Damage } from '../components'
import type { World } from '../world'

const ENEMY_RADIUS = 20

export const collisionSystem = (world: World) => {
  const projectiles = query(world, [Position, Projectile])
  const enemies = query(world, [Position, Enemy, Health])

  for (const eeid of enemies) {
    const ex = Position.x[eeid]!
    const ey = Position.y[eeid]!
    for (const peid of projectiles) {
      const dx = Position.x[peid]! - ex
      const dy = Position.y[peid]! - ey
      const hitDistSq = (ENEMY_RADIUS + Projectile.radius[peid]!) ** 2
      if (dx * dx + dy * dy < hitDistSq) {
        Health.current[eeid]! -= Damage.amount[peid]!
        removeEntity(world, peid)
        break
      }
    }
  }

  // Explosion-enemy collision: explosion is a circle centered on the player
  const explosions = query(world, [Explosion, Damage])
  const playerEid = query(world, [Player, Position])[0]
  if (playerEid !== undefined && explosions.length > 0) {
    const px = Position.x[playerEid]!
    const py = Position.y[playerEid]!
    for (const xeid of explosions) {
      const r = Explosion.radius[xeid]!
      const hitDistSq = (r + ENEMY_RADIUS) ** 2
      const alreadyHit = Explosion.alreadyHit[xeid]!
      for (const eeid of query(world, [Position, Enemy, Health])) {
        if (alreadyHit.has(eeid)) continue
        const dx = Position.x[eeid]! - px
        const dy = Position.y[eeid]! - py
        if (dx * dx + dy * dy < hitDistSq) {
          alreadyHit.add(eeid)
          Health.current[eeid]! -= Damage.amount[xeid]!
        }
      }
    }
  }
}
