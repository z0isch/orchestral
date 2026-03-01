import { query } from 'bitecs'
import { Player, Position, PLAYER_RADIUS } from '../components'
import type { World } from '../world'

export const createBoundsSystem = (canvas: HTMLCanvasElement) => (world: World) => {
  const eid = query(world, [Player, Position])[0]
  if (eid === undefined) return
  Position.x[eid] = Math.max(PLAYER_RADIUS, Math.min(canvas.width - PLAYER_RADIUS, Position.x[eid]!))
  Position.y[eid] = Math.max(PLAYER_RADIUS, Math.min(canvas.height - PLAYER_RADIUS, Position.y[eid]!))
}
