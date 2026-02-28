import { query } from 'bitecs'
import { Position } from '../components'
import type { World } from '../world'

export const createRenderSystem = (ctx: CanvasRenderingContext2D) => (world: World) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  const scale = 1 + 1 * Math.pow(1 - world.metronome.beatPhase, 3)
  const radius = 8 * scale

  for (const eid of query(world, [Position])) {
    ctx.beginPath()
    ctx.arc(Position.x[eid]!, Position.y[eid]!, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()
  }
}
