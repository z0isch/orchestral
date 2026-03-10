import { addEntity, query, addComponents, Not } from 'bitecs'
import {
  Position,
  Velocity,
  Enemy,
  BeatMovement,
  Player,
  Health,
  DamageFlash,
  Name,
  Radius,
  DEFAULT_ENEMY_RADIUS,
  Swarmer,
  SwarmConfig,
} from '../components'
import { spawnSwarmerGroup } from './swarmer-spawn'
import type { World } from '../world'

const TARGET_COUNT = 30
const SWARMER_CHANCE = 0.1
const LURCHER_CHANCE = 0.9
const SPAWN_RADIUS_MIN = 200
const SPAWN_RADIUS_MAX = 400
const SPAWN_DELAY_BEATS = 2

export const createEnemySpawnSystem = (canvas: HTMLCanvasElement) => (world: World) => {
  if (world.metronome.beat < SPAWN_DELAY_BEATS) return

  const playerEid = query(world, [Player, Position])[0]
  const px = playerEid !== undefined ? Position.x[playerEid]! : canvas.width / 2
  const py = playerEid !== undefined ? Position.y[playerEid]! : canvas.height / 2

  const current = query(world, [Enemy, Not(Swarmer)]).length
  const swarmers = query(world, [SwarmConfig]).length
  for (let i = current + swarmers; i < TARGET_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = SPAWN_RADIUS_MIN + Math.random() * (SPAWN_RADIUS_MAX - SPAWN_RADIUS_MIN)
    const spawnX = px + Math.cos(angle) * radius
    const spawnY = py + Math.sin(angle) * radius

    if (Math.random() < SWARMER_CHANCE) {
      spawnSwarmerGroup(world, spawnX, spawnY)
      break
    }

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
        Radius,
      ])
    } catch (e) {
      console.log(e)
      continue
    }
    Position.x[eid] = spawnX
    Position.y[eid] = spawnY
    Velocity.x[eid] = 0
    Velocity.y[eid] = 0
    if (Math.random() < LURCHER_CHANCE) {
      BeatMovement.distance[eid] = (Math.floor(Math.random() * 4) + 4) * 2
      BeatMovement.cadence[eid] = world.metronome.subdivisions
      BeatMovement.overSubBeats[eid] = 1
      BeatMovement.moveEndSubBeat[eid] = 0
      BeatMovement.lastMoveEndSubBeat[eid] = world.metronome.subBeatIndex
      BeatMovement.aimLeadSubBeats[eid] = 1
    } else {
      BeatMovement.distance[eid] = (Math.floor(Math.random() * 4) + 4) * 100
      BeatMovement.cadence[eid] = (Math.floor(Math.random() * 4) + 3) * world.metronome.subdivisions
      BeatMovement.overSubBeats[eid] = 12
      BeatMovement.moveEndSubBeat[eid] = 0
      BeatMovement.lastMoveEndSubBeat[eid] = world.metronome.subBeatIndex
      BeatMovement.aimLeadSubBeats[eid] = 4
    }
    BeatMovement.targetX[eid] = px
    BeatMovement.targetY[eid] = py
    Health.current[eid] = 200
    Health.max[eid] = 200
    DamageFlash.startBeat[eid] = -Infinity
    Radius.value[eid] = DEFAULT_ENEMY_RADIUS
    Name.value[eid] = `Enemy ${i}`
  }
}
