import { query, removeEntity } from 'bitecs'
import {
  Position,
  Projectile,
  ExplosiveProjectile,
  Enemy,
  Explosion,
  Cloud,
  Player,
  Health,
  Damage,
  DamageFlash,
  Radius,
} from '../components'
import type { World } from '../world'

export const collisionSystem = (world: World) => {
  const projectiles = query(world, [Position, Projectile])
  const explosiveProjectiles = new Set(query(world, [Position, Projectile, ExplosiveProjectile]))
  const enemies = query(world, [Position, Enemy, Health, Radius])

  for (const eeid of enemies) {
    const ex = Position.x[eeid]!
    const ey = Position.y[eeid]!
    const eRadius = Radius.value[eeid]!
    for (const peid of projectiles) {
      const dx = Position.x[peid]! - ex
      const dy = Position.y[peid]! - ey
      const hitDistSq = (eRadius + Projectile.radius[peid]!) ** 2
      if (dx * dx + dy * dy < hitDistSq) {
        Health.current[eeid]! -= Damage.amount[peid]!
        DamageFlash.startBeat[eeid] = world.metronome.beat + world.metronome.beatPhase
        if (explosiveProjectiles.has(peid)) {
          world.attacks.pending.push({
            type: {
              tag: 'explosion',
              radius: ExplosiveProjectile.explosionRadius[peid]!,
              damage: ExplosiveProjectile.explosionDamage[peid]!,
            },
            x: Position.x[peid]!,
            y: Position.y[peid]!,
            angle: 0,
            targetX: Position.x[peid]!,
            targetY: Position.y[peid]!,
          })
        }
        removeEntity(world, peid)
        break
      }
    }
  }

  // Explosion-enemy collision: explosion is centered on the player unless it has its own Position
  const explosions = query(world, [Explosion, Damage])
  const positionedExplosions = new Set(query(world, [Explosion, Damage, Position]))
  const playerEid = query(world, [Player, Position])[0]
  if (explosions.length > 0 && (playerEid !== undefined || positionedExplosions.size > 0)) {
    const px = playerEid !== undefined ? Position.x[playerEid]! : 0
    const py = playerEid !== undefined ? Position.y[playerEid]! : 0
    for (const xeid of explosions) {
      const r = Explosion.radius[xeid]!
      const alreadyHit = Explosion.alreadyHit[xeid] ?? (Explosion.alreadyHit[xeid] = new Set())
      const cx = positionedExplosions.has(xeid) ? Position.x[xeid]! : px
      const cy = positionedExplosions.has(xeid) ? Position.y[xeid]! : py
      for (const eeid of query(world, [Position, Enemy, Health, Radius])) {
        if (alreadyHit.has(eeid)) continue
        const eRadius = Radius.value[eeid]!
        const hitDistSq = (r + eRadius) ** 2
        const dx = Position.x[eeid]! - cx
        const dy = Position.y[eeid]! - cy
        if (dx * dx + dy * dy < hitDistSq) {
          alreadyHit.add(eeid)
          Health.current[eeid]! -= Damage.amount[xeid]!
          DamageFlash.startBeat[eeid] = world.metronome.beat + world.metronome.beatPhase
        }
      }
    }
  }

  // Cloud-enemy collision: cloud is a stationary circle at its Position
  const explosiveClouds = new Set(query(world, [Position, Cloud, ExplosiveProjectile]))
  for (const ceid of query(world, [Position, Cloud, Damage])) {
    const cx = Position.x[ceid]!
    const cy = Position.y[ceid]!
    const r = Cloud.radius[ceid]!
    const alreadyHit = Cloud.alreadyHitThisSubbeat[ceid] ?? (Cloud.alreadyHitThisSubbeat[ceid] = new Set())
    for (const eeid of query(world, [Position, Enemy, Health, Radius])) {
      if (alreadyHit.has(eeid)) continue
      const eRadius = Radius.value[eeid]!
      const hitDistSq = (r + eRadius) ** 2
      const dx = Position.x[eeid]! - cx
      const dy = Position.y[eeid]! - cy
      if (dx * dx + dy * dy < hitDistSq) {
        alreadyHit.add(eeid)
        Health.current[eeid]! -= Damage.amount[ceid]!
        if (explosiveClouds.has(ceid)) {
          world.attacks.pending.push({
            type: {
              tag: 'explosion',
              radius: ExplosiveProjectile.explosionRadius[ceid]!,
              damage: ExplosiveProjectile.explosionDamage[ceid]!,
            },
            x: Position.x[eeid]!,
            y: Position.y[eeid]!,
            angle: 0,
            targetX: Position.x[eeid]!,
            targetY: Position.y[eeid]!,
          })
        }
      }
    }
  }
}
