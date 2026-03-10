import { query } from 'bitecs'
import { Dash, Player, Velocity } from '../components'
import type { World } from '../world'

export const PLAYER_SPEED = 100
const DEADZONE = 0.15

export const inputSystem = (world: World) => {
  const eid = query(world, [Player, Velocity])[0]
  if (eid === undefined) return
  if (Dash.remaining[eid]! > 0) return

  const { axes } = world.gamepad

  let ax = axes[0] ?? 0
  let ay = axes[1] ?? 0
  if (Math.abs(ax) < DEADZONE) ax = 0
  if (Math.abs(ay) < DEADZONE) ay = 0

  Velocity.x[eid] = ax * PLAYER_SPEED
  Velocity.y[eid] = ay * PLAYER_SPEED
  if (ax !== 0 || ay !== 0) Player.facing[eid] = Math.atan2(ay, ax)
}
