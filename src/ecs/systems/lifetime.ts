import { query, removeEntity } from 'bitecs'
import { Lifetime } from '../components'
import type { World } from '../world'

export const lifetimeSystem = (world: World) => {
  for (const eid of query(world, [Lifetime])) {
    Lifetime.remaining[eid]! -= world.time.delta
    if (Lifetime.remaining[eid]! <= 0) {
      removeEntity(world, eid)
    }
  }
}
