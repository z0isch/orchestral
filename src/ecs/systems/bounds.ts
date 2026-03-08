import { query } from 'bitecs'
import { Player, Position, Radius } from '../components'
import type { World } from '../world'

export const createBoundsSystem = (canvas: HTMLCanvasElement) => (world: World) => {
  const eid = query(world, [Player, Position, Radius])[0]
  if (eid === undefined) return
  const r = Radius.value[eid]!
  Position.x[eid] = Math.max(
    r,
    Math.min(canvas.width - r, Position.x[eid]!)
  )
  Position.y[eid] = Math.max(
    r,
    Math.min(canvas.height - r, Position.y[eid]!)
  )
}
