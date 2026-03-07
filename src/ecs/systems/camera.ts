import { query } from 'bitecs'
import { Position, Velocity, Player } from '../components'
import type { World } from '../world'

const DAMPING = 6 // spring constant — higher = snappier
const LOOKAHEAD = 120 // max lookahead distance in pixels
const MAX_SPEED = 400 // player speed at which full lookahead is applied

export const cameraSystem = (world: World) => {
  const playerEid = query(world, [Player, Position, Velocity])[0]
  if (playerEid === undefined) return

  const px = Position.x[playerEid]!
  const py = Position.y[playerEid]!
  const vx = Velocity.x[playerEid]!
  const vy = Velocity.y[playerEid]!

  let targetX = px
  let targetY = py

  const speed = Math.sqrt(vx * vx + vy * vy)
  if (speed > 0) {
    const scale = Math.min(speed / MAX_SPEED, 1) * LOOKAHEAD
    targetX += (vx / speed) * scale
    targetY += (vy / speed) * scale
  }

  const t = 1 - Math.exp(-DAMPING * world.time.delta)
  world.camera.x += (targetX - world.camera.x) * t
  world.camera.y += (targetY - world.camera.y) * t
}
