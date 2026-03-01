import { addEntity, addComponent } from 'bitecs'
import { Position, Velocity, Attack, Lifetime, Projectile } from '../components'
import type { World } from '../world'

const ATTACK_SPEED = 800
const ATTACK_LIFETIME = 2

export const attackSystem = (world: World) => {
  for (const req of world.attacks.pending) {
    const eid = addEntity(world)
    addComponent(world, eid, Position)
    addComponent(world, eid, Velocity)
    addComponent(world, eid, Attack)
    addComponent(world, eid, Lifetime)
    addComponent(world, eid, Projectile)
    Position.x[eid] = req.x
    Position.y[eid] = req.y
    Velocity.x[eid] = Math.cos(req.angle) * ATTACK_SPEED
    Velocity.y[eid] = Math.sin(req.angle) * ATTACK_SPEED
    Attack.button[eid] = req.button
    Attack.damage[eid] = req.damage
    Lifetime.remaining[eid] = ATTACK_LIFETIME
  }
  world.attacks.pending.length = 0
}
