import { addEntity, addComponent, query, removeEntity } from 'bitecs'
import {
  Position,
  Velocity,
  Projectile,
  Explosion,
  Lightning,
  Lifetime,
  Enemy,
} from '../components'
import type { World } from '../world'

const spawnProjectile = (world: World, eid: number, angle: number, speed: number, radius: number) => {
  addComponent(world, eid, Velocity)
  addComponent(world, eid, Projectile)
  Velocity.x[eid] = Math.cos(angle) * speed
  Velocity.y[eid] = Math.sin(angle) * speed
  Projectile.radius[eid] = radius
}

const spawnExplosion = (world: World, eid: number, radius: number, lifetime: number) => {
  addComponent(world, eid, Explosion)
  addComponent(world, eid, Lifetime)
  Explosion.radius[eid] = radius
  Explosion.duration[eid] = lifetime
  Lifetime.remaining[eid] = lifetime
}

const spawnLightning = (world: World, eid: number, lifetime: number) => {
  const enemies = query(world, [Enemy, Position])
  if (enemies.length === 0) return

  const targetEid = enemies[Math.floor(Math.random() * enemies.length)]!
  const tx = Position.x[targetEid]!
  const ty = Position.y[targetEid]!
  removeEntity(world, targetEid)

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
        spawnProjectile(world, eid, req.angle, req.type.speed, req.type.radius)
        break
      case 'explosion':
        spawnExplosion(world, eid, req.type.radius, world.metronome.interval / 2)
        break
      case 'lightning':
        spawnLightning(world, eid, world.metronome.interval / 2)
        break
      default: {
        const _: never = req.type
        throw new Error('Unreachable')
      }
    }
  }
  world.attacks.pending.length = 0
}
