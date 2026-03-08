import { query, Pair, removeEntity } from 'bitecs'
import { SwarmConfig, BelongsToSwarm } from '../components'
import type { World } from '../world'

export const swarmCleanupSystem = (world: World) => {
  for (const swarmEid of query(world, [SwarmConfig])) {
    const members = query(world, [Pair(BelongsToSwarm, swarmEid)])
    if (members.length === 0) {
      removeEntity(world, swarmEid)
    }
  }
}
