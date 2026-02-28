import { query } from 'bitecs'
import { Position, Velocity } from '../components'
import type { World } from '../world'

export const movementSystem = (world: World, width: number, height: number) => {
  const { isOnBeat, interval } = world.metronome

  for (const eid of query(world, [Position, Velocity])) {
    if (isOnBeat) {
      const targetX = Math.random() * width
      const targetY = Math.random() * height
      Velocity.x[eid] = (targetX - Position.x[eid]!) / interval
      Velocity.y[eid] = (targetY - Position.y[eid]!) / interval
    }

    Position.x[eid]! += Velocity.x[eid]! * world.time.delta
    Position.y[eid]! += Velocity.y[eid]! * world.time.delta
  }
}
