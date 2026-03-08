import { addEntity, addComponents } from 'bitecs'
import { Position, Velocity, Enemy, Health, DamageFlash, Name, Swarmer, Radius, DEFAULT_SWARMER_RADIUS } from '../components'
import type { World } from '../world'

const SWARM_COUNT = 8
const SWARMER_HP = 3
const SWARMER_SPEED = 120
const SPAWN_SPREAD = 40

let nextGroupId = 0

export const spawnSwarmerGroup = (world: World, centerX: number, centerY: number) => {
  const groupId = nextGroupId++
  for (let i = 0; i < SWARM_COUNT; i++) {
    const eid = addEntity(world)
    try {
      addComponents(world, eid, [Position, Velocity, Enemy, Health, DamageFlash, Name, Swarmer, Radius])
    } catch (e) {
      console.log(e)
      continue
    }
    const angle = (i / SWARM_COUNT) * Math.PI * 2
    Position.x[eid] = centerX + Math.cos(angle) * SPAWN_SPREAD
    Position.y[eid] = centerY + Math.sin(angle) * SPAWN_SPREAD
    Velocity.x[eid] = 0
    Velocity.y[eid] = 0
    Health.current[eid] = SWARMER_HP
    Health.max[eid] = SWARMER_HP
    DamageFlash.startBeat[eid] = -Infinity
    Swarmer.groupId[eid] = groupId
    Swarmer.speed[eid] = SWARMER_SPEED
    Radius.value[eid] = DEFAULT_SWARMER_RADIUS
    Name.value[eid] = `Swarmer ${groupId}-${i}`
  }
}
