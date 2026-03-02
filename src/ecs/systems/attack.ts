import { addEntity, addComponent } from 'bitecs'
import { Position, Velocity, Projectile, Whip, Lifetime } from '../components'
import type { World } from '../world'

const spawnWand = (world: World, eid: number, angle: number, speed: number) => {
  addComponent(world, eid, Velocity)
  addComponent(world, eid, Projectile)
  Velocity.x[eid] = Math.cos(angle) * speed
  Velocity.y[eid] = Math.sin(angle) * speed
}

const spawnWhip = (world: World, eid: number, width: number, height: number, lifetime: number) => {
  addComponent(world, eid, Whip)
  addComponent(world, eid, Lifetime)
  Whip.width[eid] = width
  Whip.height[eid] = height
  Whip.duration[eid] = lifetime
  Lifetime.remaining[eid] = lifetime
}

export const attackSystem = (world: World) => {
  for (const req of world.attacks.pending) {
    const eid = addEntity(world)

    switch (req.type.tag) {
      case 'wand':
        addComponent(world, eid, Position)
        Position.x[eid] = req.x
        Position.y[eid] = req.y
        spawnWand(world, eid, req.angle, req.type.speed)
        break
      case 'whip':
        spawnWhip(
          world,
          eid,
          req.type.width,
          req.type.height,
          req.type.subBeatDuration * world.metronome.subInterval
        )
        break
      default: {
        const _: never = req.type
        throw new Error('Unreachable')
      }
    }
  }
  world.attacks.pending.length = 0
}
