import { Position, Velocity } from '../components'
import type { World } from '../world'

const SPEED = 400
const DEADZONE = 0.15
const PLAYER_RADIUS = 16

export { PLAYER_RADIUS }

export const createPlayerSystem = (canvas: HTMLCanvasElement) => (world: World) => {
  const eid = world.player.eid
  const { axes } = world.gamepad
  const dt = world.time.delta

  let ax = axes[0] ?? 0
  let ay = axes[1] ?? 0
  if (Math.abs(ax) < DEADZONE) ax = 0
  if (Math.abs(ay) < DEADZONE) ay = 0

  Velocity.x[eid] = ax * SPEED
  Velocity.y[eid] = ay * SPEED
  if (ax !== 0 || ay !== 0) world.player.facing = Math.atan2(ay, ax)
  Position.x[eid] = Math.max(PLAYER_RADIUS, Math.min(canvas.width - PLAYER_RADIUS, (Position.x[eid] ?? 0) + Velocity.x[eid]! * dt))
  Position.y[eid] = Math.max(PLAYER_RADIUS, Math.min(canvas.height - PLAYER_RADIUS, (Position.y[eid] ?? 0) + Velocity.y[eid]! * dt))
}
