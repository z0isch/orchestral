import { addEntity, addComponent, query, addComponents } from 'bitecs'
import {
  Position,
  Velocity,
  Enemy,
  BeatMovement,
  Player,
  Health,
  DamageFlash,
  Name,
} from '../components'
import type { World } from '../world'

const TARGET_COUNT = 2
const ENEMY_BEAT_DISTANCE = 80
const SPAWN_RADIUS_MIN = 200
const SPAWN_RADIUS_MAX = 400
const SPAWN_DELAY_BEATS = 2

export const createEnemySpawnSystem = (canvas: HTMLCanvasElement) => (world: World) => {
  if (world.metronome.beat < SPAWN_DELAY_BEATS) return

  const playerEid = query(world, [Player, Position])[0]
  const px = playerEid !== undefined ? Position.x[playerEid]! : canvas.width / 2
  const py = playerEid !== undefined ? Position.y[playerEid]! : canvas.height / 2

  const current = query(world, [Enemy]).length
  for (let i = current; i < TARGET_COUNT; i++) {
    const eid = addEntity(world)
    try {
      addComponents(world, eid, [
        Position,
        Velocity,
        Enemy,
        BeatMovement,
        Health,
        DamageFlash,
        Name,
      ])
    } catch (e) {
      console.log(e)
      continue
    }
    const angle = Math.random() * Math.PI * 2
    const radius = SPAWN_RADIUS_MIN + Math.random() * (SPAWN_RADIUS_MAX - SPAWN_RADIUS_MIN)
    Position.x[eid] = px + Math.cos(angle) * radius
    Position.y[eid] = py + Math.sin(angle) * radius
    Velocity.x[eid] = 0
    Velocity.y[eid] = 0
    BeatMovement.distance[eid] = 700
    BeatMovement.cadence[eid] = (Math.floor(Math.random() * 4) + 3) * world.metronome.subdivisions
    BeatMovement.overSubBeats[eid] = 3 //Math.floor(Math.random() * 3) + 1
    BeatMovement.moveEndSubBeat[eid] = 0
    BeatMovement.lastMoveEndSubBeat[eid] = world.metronome.subBeatIndex
    BeatMovement.aimLeadSubBeats[eid] = 2
    BeatMovement.targetX[eid] = px
    BeatMovement.targetY[eid] = py
    Health.current[eid] = 20
    Health.max[eid] = 20
    DamageFlash.startBeat[eid] = -Infinity
    Name.value[eid] = `Enemy ${i}`
  }
}
