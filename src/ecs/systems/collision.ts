import { query, removeEntity } from 'bitecs'
import { Position, Projectile, Enemy, Whip, Player, PLAYER_RADIUS } from '../components'
import type { World } from '../world'

const ENEMY_RADIUS = 20
const PROJECTILE_RADIUS = 3
const HIT_DIST_SQ = (ENEMY_RADIUS + PROJECTILE_RADIUS) ** 2

/** Check if a circle (enemy) overlaps an axis-aligned rectangle centered at (rx, ry). */
const circleRectOverlap = (
  cx: number, cy: number, cr: number,
  rx: number, ry: number, rw: number, rh: number,
): boolean => {
  const dx = cx - rx
  const dy = cy - ry

  // Closest point on the axis-aligned rect [-rw/2, rw/2] x [-rh/2, rh/2]
  const nearX = Math.max(-rw / 2, Math.min(rw / 2, dx))
  const nearY = Math.max(-rh / 2, Math.min(rh / 2, dy))
  const ex = dx - nearX
  const ey = dy - nearY
  return ex * ex + ey * ey < cr * cr
}

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
        removeEntity(world, peid)
        break
      }
    }
  }

  // Whip-enemy collision: whip follows player position
  const whips = query(world, [Whip])
  const playerEid = query(world, [Player, Position])[0]
  if (playerEid !== undefined && whips.length > 0) {
    const wx = Position.x[playerEid]!
    const wy = Position.y[playerEid]! - PLAYER_RADIUS
    for (const weid of whips) {
      const ww = Whip.width[weid]!
      const wh = Whip.height[weid]!
      for (const eeid of query(world, [Position, Enemy])) {
        const ex = Position.x[eeid]!
        const ey = Position.y[eeid]!
        if (circleRectOverlap(ex, ey, ENEMY_RADIUS, wx, wy, ww, wh)) {
          removeEntity(world, eeid)
        }
      }
    }
  }
}
