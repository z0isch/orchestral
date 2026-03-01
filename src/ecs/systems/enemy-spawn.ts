import { addEntity, addComponent, query } from 'bitecs'
import { Position, Velocity, Enemy, BeatMovement, Player } from '../components'
import type { World } from '../world'

const TARGET_COUNT = 20
const ENEMY_BEAT_DISTANCE = 80
const SPAWN_RADIUS_MIN = 300
const SPAWN_RADIUS_MAX = 800
const SPAWN_DELAY_BEATS = 10

export const createEnemySpawnSystem = (canvas: HTMLCanvasElement) => (world: World) => {
  if (world.metronome.beat < SPAWN_DELAY_BEATS) return

  const playerEid = query(world, [Player, Position])[0]
  const px = playerEid !== undefined ? Position.x[playerEid]! : canvas.width / 2
  const py = playerEid !== undefined ? Position.y[playerEid]! : canvas.height / 2

  const current = query(world, [Enemy]).length
  for (let i = current; i < TARGET_COUNT; i++) {
    const eid = addEntity(world)
    addComponent(world, eid, Position)
    addComponent(world, eid, Velocity)
    addComponent(world, eid, Enemy)
    addComponent(world, eid, BeatMovement)
    const angle = Math.random() * Math.PI * 2
    const radius = SPAWN_RADIUS_MIN + Math.random() * (SPAWN_RADIUS_MAX - SPAWN_RADIUS_MIN)
    Position.x[eid] = px + Math.cos(angle) * radius
    Position.y[eid] = py + Math.sin(angle) * radius
    Velocity.x[eid] = 0
    Velocity.y[eid] = 0
    BeatMovement.distance[eid] = ENEMY_BEAT_DISTANCE
  }
}
