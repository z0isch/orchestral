import { query } from 'bitecs'
import { Position, Velocity } from '../components'
import type { World } from '../world'

export const movementSystem = (world: World) => {
  for (const eid of query(world, [Position, Velocity])) {
    Position.x[eid]! += Velocity.x[eid]! * world.time.delta
    Position.y[eid]! += Velocity.y[eid]! * world.time.delta
  }
}
