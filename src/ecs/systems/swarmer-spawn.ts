import { addEntity, addComponent, addComponents } from 'bitecs'
import {
  Position,
  Velocity,
  Enemy,
  Health,
  DamageFlash,
  Name,
  Swarmer,
  Radius,
  SwarmConfig,
  BelongsToSwarm,
  DEFAULT_SWARMER_RADIUS,
} from '../components'
import type { World } from '../world'

const SWARM_COUNT = 8
const SWARMER_HP = 3
const SPAWN_SPREAD = 40

export const spawnSwarmerGroup = (world: World, centerX: number, centerY: number) => {
  const swarmEid = addEntity(world)
  addComponents(world, swarmEid, [Name, SwarmConfig])
  Name.value[swarmEid] = 'SwarmConfig'
  SwarmConfig.cohesionWeight[swarmEid] = 0.3
  SwarmConfig.separationWeight[swarmEid] = 1.5
  SwarmConfig.chaseWeight[swarmEid] = 1.0
  SwarmConfig.separationRadius[swarmEid] = 30
  SwarmConfig.speed[swarmEid] = 150

  for (let i = 0; i < SWARM_COUNT; i++) {
    const eid = addEntity(world)
    try {
      addComponents(world, eid, [
        Position,
        Velocity,
        Enemy,
        Health,
        DamageFlash,
        Name,
        Swarmer,
        Radius,
      ])
      addComponent(world, eid, BelongsToSwarm(swarmEid))
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
    Radius.value[eid] = DEFAULT_SWARMER_RADIUS
    Name.value[eid] = `Swarmer ${swarmEid}-${i}`
  }
}
