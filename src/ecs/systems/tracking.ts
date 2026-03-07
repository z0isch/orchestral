import { entityExists, getRelationTargets, query } from 'bitecs'
import { Position, Velocity, Targeting } from '../components'
import type { World } from '../world'

export const trackingSystem = (world: World) => {
  for (const eid of query(world, [Position, Velocity])) {
    for (const targetEid of getRelationTargets(world, eid, Targeting)) {
      if (entityExists(world, targetEid)) {
        const dx = Position.x[targetEid]! - Position.x[eid]!
        const dy = Position.y[targetEid]! - Position.y[eid]!
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 0) {
          const vx = Velocity.x[eid]!
          const vy = Velocity.y[eid]!
          const speed = Math.sqrt(vx * vx + vy * vy)
          Velocity.x[eid] = (dx / dist) * speed
          Velocity.y[eid] = (dy / dist) * speed
        }
      }
    }
  }
}
