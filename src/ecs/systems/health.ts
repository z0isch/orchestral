import { query, removeEntity } from 'bitecs'
import { Health } from '../components'
import type { World } from '../world'

export const healthSystem = (world: World) => {
  for (const eid of query(world, [Health])) {
    if (Health.current[eid]! <= 0) {
      removeEntity(world, eid)
    }
  }
}
