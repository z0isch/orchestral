import { query } from 'bitecs'
import { Cloud } from '../components'
import type { World } from '../world'

export const cloudSystem = (world: World) => {
  for (const eid of query(world, [Cloud])) {
    Cloud.subBeatTimer[eid]! -= world.time.delta
    if (Cloud.subBeatTimer[eid]! <= 0) {
      Cloud.alreadyHitThisSubbeat[eid]!.clear()
      Cloud.subBeatTimer[eid]! += Cloud.subBeatInterval[eid]!
    }
  }
}
