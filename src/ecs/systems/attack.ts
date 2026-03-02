import { addEntity, addComponent, query } from 'bitecs'
import {
  Position,
  Velocity,
  Projectile,
  Explosion,
  Lightning,
  Cloud,
  Lifetime,
  Enemy,
  Damage,
  Health,
} from '../components'
import type { World } from '../world'

const spawnProjectile = (world: World, eid: number, angle: number, speed: number, radius: number, damage: number) => {
  addComponent(world, eid, Velocity)
  addComponent(world, eid, Projectile)
  addComponent(world, eid, Damage)
  Velocity.x[eid] = Math.cos(angle) * speed
  Velocity.y[eid] = Math.sin(angle) * speed
  Projectile.radius[eid] = radius
  Damage.amount[eid] = damage
}

const spawnExplosion = (world: World, eid: number, radius: number, lifetime: number, damage: number) => {
  addComponent(world, eid, Explosion)
  addComponent(world, eid, Lifetime)
  addComponent(world, eid, Damage)
  Explosion.radius[eid] = radius
  Explosion.duration[eid] = lifetime
  Explosion.alreadyHit[eid] = new Set()
  Lifetime.remaining[eid] = lifetime
  Damage.amount[eid] = damage
}

const spawnCloud = (world: World, eid: number, x: number, y: number, radius: number, subBeatDuration: number, damage: number) => {
  const subBeatInterval = world.metronome.subInterval
  addComponent(world, eid, Position)
  addComponent(world, eid, Cloud)
  addComponent(world, eid, Lifetime)
  addComponent(world, eid, Damage)
  Position.x[eid] = x
  Position.y[eid] = y
  Cloud.radius[eid] = radius
  Cloud.duration[eid] = subBeatDuration * subBeatInterval
  Cloud.subBeatInterval[eid] = subBeatInterval
  Cloud.subBeatTimer[eid] = subBeatInterval
  Cloud.alreadyHitThisSubbeat[eid] = new Set()
  Lifetime.remaining[eid] = subBeatDuration * subBeatInterval
  Damage.amount[eid] = damage
}

const spawnLightning = (world: World, eid: number, lifetime: number, damage: number) => {
  const enemies = query(world, [Enemy, Position])
  if (enemies.length === 0) return

  const targetEid = enemies[Math.floor(Math.random() * enemies.length)]!
  const tx = Position.x[targetEid]!
  const ty = Position.y[targetEid]!
  Health.current[targetEid] = (Health.current[targetEid] ?? 0) - damage

  addComponent(world, eid, Lightning)
  addComponent(world, eid, Lifetime)
  Lightning.targetX[eid] = tx
  Lightning.targetY[eid] = ty
  Lightning.duration[eid] = lifetime
  Lifetime.remaining[eid] = lifetime
}

export const attackSystem = (world: World) => {
  for (const req of world.attacks.pending) {
    const eid = addEntity(world)

    switch (req.type.tag) {
      case 'projectile':
        addComponent(world, eid, Position)
        Position.x[eid] = req.x
        Position.y[eid] = req.y
        spawnProjectile(world, eid, req.angle, req.type.speed, req.type.radius, req.type.damage)
        break
      case 'explosion':
        spawnExplosion(world, eid, req.type.radius, world.metronome.interval / 2, req.type.damage)
        break
      case 'lightning':
        spawnLightning(world, eid, world.metronome.interval / 2, req.type.damage)
        break
      case 'cloud':
        spawnCloud(world, eid, req.x, req.y, req.type.radius, req.type.subBeatDuration, req.type.damage)
        break
      default: {
        const x: never = req.type
        throw new Error(`Unreachable: ${x}`)
      }
    }
  }
  world.attacks.pending.length = 0
}
