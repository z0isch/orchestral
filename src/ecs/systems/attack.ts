import { addEntity, addComponent, query, addComponents } from 'bitecs'
import {
  Position,
  Velocity,
  Projectile,
  Explosion,
  Lightning,
  Cloud,
  LightningBeam,
  ExplosiveProjectile,
  Lifetime,
  Enemy,
  Player,
  Damage,
  Health,
  DamageFlash,
  Name,
  Targeting,
  Radius,
} from '../components'
import { isOnBeam } from '../geometry'
import type { World } from '../world'

const PROJECTILE_LIFETIME = 5

const findNearestEnemy = (world: World, x: number, y: number): number | null => {
  const enemies = query(world, [Enemy, Position])
  let minDistSq = Infinity
  let closestEid: number | null = null
  for (const e of enemies) {
    const dx = Position.x[e]! - x
    const dy = Position.y[e]! - y
    const dSq = dx * dx + dy * dy
    if (dSq < minDistSq) {
      minDistSq = dSq
      closestEid = e
    }
  }
  return closestEid
}

const spawnProjectile = (
  world: World,
  eid: number,
  x: number,
  y: number,
  speed: number,
  radius: number,
  damage: number
) => {
  addComponents(world, eid, [Velocity, Projectile, Damage, Lifetime])
  Projectile.radius[eid] = radius
  Damage.amount[eid] = damage
  Lifetime.remaining[eid] = PROJECTILE_LIFETIME

  const targetEid = findNearestEnemy(world, x, y)
  if (targetEid !== null) {
    try {
      addComponent(world, eid, Targeting(targetEid))
    } catch (_e) {
      return
    }

    const dx = Position.x[targetEid]! - x
    const dy = Position.y[targetEid]! - y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 0) {
      Velocity.x[eid] = (dx / dist) * speed
      Velocity.y[eid] = (dy / dist) * speed
    } else {
      Velocity.x[eid] = speed
      Velocity.y[eid] = 0
    }
  } else {
    // No enemies — fire in player facing direction
    const playerEid = query(world, [Player, Position])[0]
    const angle = playerEid !== undefined ? Player.facing[playerEid]! : 0
    Velocity.x[eid] = Math.cos(angle) * speed
    Velocity.y[eid] = Math.sin(angle) * speed
  }
}

const spawnExplosion = (
  world: World,
  eid: number,
  radius: number,
  lifetime: number,
  damage: number
) => {
  addComponent(world, eid, Explosion)
  addComponent(world, eid, Lifetime)
  addComponent(world, eid, Damage)
  Explosion.radius[eid] = radius
  Explosion.duration[eid] = lifetime
  Explosion.alreadyHit[eid] = new Set()
  Lifetime.remaining[eid] = lifetime
  Damage.amount[eid] = damage
}

const spawnCloud = (
  world: World,
  eid: number,
  x: number,
  y: number,
  radius: number,
  subBeatDuration: number,
  damage: number
) => {
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

const spawnLightning = (
  world: World,
  eid: number,
  lifetime: number,
  damage: number,
  targetX?: number,
  targetY?: number
) => {
  const enemies = query(world, [Enemy, Position, DamageFlash])
  if (enemies.length === 0) return

  let tx: number, ty: number
  if (targetX !== undefined && targetY !== undefined) {
    let minDistSq = Infinity
    let closestEid = -1
    for (const e of enemies) {
      const dx = Position.x[e]! - targetX
      const dy = Position.y[e]! - targetY
      const dSq = dx * dx + dy * dy
      if (dSq < minDistSq) {
        minDistSq = dSq
        closestEid = e
      }
    }
    if (closestEid === -1) return
    tx = Position.x[closestEid]!
    ty = Position.y[closestEid]!
    Health.current[closestEid] = (Health.current[closestEid] ?? 0) - damage
    DamageFlash.startBeat[closestEid] = world.metronome.beat + world.metronome.beatPhase
  } else {
    const targetEid = enemies[Math.floor(Math.random() * enemies.length)]!
    tx = Position.x[targetEid]!
    ty = Position.y[targetEid]!
    Health.current[targetEid] = (Health.current[targetEid] ?? 0) - damage
    DamageFlash.startBeat[targetEid] = world.metronome.beat + world.metronome.beatPhase
  }

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
    addComponent(world, eid, [Name])
    switch (req.type.tag) {
      case 'projectile':
        addComponent(world, eid, Position)
        Position.x[eid] = req.x
        Position.y[eid] = req.y
        spawnProjectile(world, eid, req.x, req.y, req.type.speed, req.type.radius, req.type.damage)
        Name.value[eid] = 'Projectile'
        break
      case 'explosion':
        if (req.targetX !== undefined && req.targetY !== undefined) {
          addComponent(world, eid, Position)
          Position.x[eid] = req.targetX
          Position.y[eid] = req.targetY
        }
        spawnExplosion(world, eid, req.type.radius, world.metronome.interval / 2, req.type.damage)
        Name.value[eid] = 'Explosion'
        break
      case 'lightning':
        spawnLightning(
          world,
          eid,
          world.metronome.interval / 2,
          req.type.damage,
          req.targetX,
          req.targetY
        )
        Name.value[eid] = 'Lightning'
        break
      case 'cloud':
        spawnCloud(
          world,
          eid,
          req.x,
          req.y,
          req.type.radius,
          req.type.subBeatDuration,
          req.type.damage
        )
        Name.value[eid] = 'Cloud'
        break
      case 'lightning-beam': {
        const playerEid = query(world, [Player, Position])[0]
        if (playerEid === undefined) break
        const enemies = query(world, [Enemy, Position, DamageFlash, Radius])
        if (enemies.length === 0) break

        const px = Position.x[playerEid]!
        const py = Position.y[playerEid]!

        // Aim at nearest enemy
        let nearestEid = enemies[0]!
        let minDistSq = Infinity
        for (const e of enemies) {
          const dx = Position.x[e]! - px
          const dy = Position.y[e]! - py
          const dSq = dx * dx + dy * dy
          if (dSq < minDistSq) {
            minDistSq = dSq
            nearestEid = e
          }
        }
        const beamAngle = Math.atan2(Position.y[nearestEid]! - py, Position.x[nearestEid]! - px)
        const lifetime = req.type.subBeatDuration * world.metronome.subInterval
        const alreadyHit: Set<number> = new Set()

        addComponent(world, eid, LightningBeam)
        addComponent(world, eid, Lifetime)
        LightningBeam.originEid[eid] = playerEid
        LightningBeam.angle[eid] = beamAngle
        LightningBeam.damage[eid] = req.type.damage
        LightningBeam.alreadyHit[eid] = alreadyHit
        LightningBeam.duration[eid] = lifetime
        LightningBeam.spawnExplosionOnHit[eid] = req.type.spawnExplosionOnHit ? 1 : 0
        LightningBeam.spawnCloudOnHit[eid] = req.type.spawnCloudOnHit ? 1 : 0
        Lifetime.remaining[eid] = lifetime
        Name.value[eid] = 'Lightning Beam'

        // Immediately damage all enemies on the beam line
        for (const e of enemies) {
          const eRadius = Radius.value[e]!
          if (isOnBeam(px, py, beamAngle, Position.x[e]!, Position.y[e]!, eRadius)) {
            alreadyHit.add(e)
            Health.current[e] = (Health.current[e] ?? 0) - req.type.damage
            DamageFlash.startBeat[e] = world.metronome.beat + world.metronome.beatPhase
            if (req.type.spawnExplosionOnHit) {
              world.attacks.pending.push({
                type: { tag: 'explosion', radius: 200, damage: req.type.damage },
                x: Position.x[e]!,
                y: Position.y[e]!,
                angle: 0,
                targetX: Position.x[e]!,
                targetY: Position.y[e]!,
              })
            }
            if (req.type.spawnCloudOnHit) {
              world.attacks.pending.push({
                type: { tag: 'cloud', radius: 120, subBeatDuration: 2, damage: req.type.damage },
                x: Position.x[e]!,
                y: Position.y[e]!,
                angle: 0,
              })
            }
          }
        }
        break
      }
      case 'cloud-projectile': {
        const enemies = query(world, [Enemy, Position])
        if (enemies.length === 0) break

        let nearestEid = enemies[0]!
        let minDistSq = Infinity
        for (const e of enemies) {
          const dx = Position.x[e]! - req.x
          const dy = Position.y[e]! - req.y
          const dSq = dx * dx + dy * dy
          if (dSq < minDistSq) {
            minDistSq = dSq
            nearestEid = e
          }
        }
        const angle = Math.atan2(Position.y[nearestEid]! - req.y, Position.x[nearestEid]! - req.x)

        spawnCloud(
          world,
          eid,
          req.x,
          req.y,
          req.type.radius,
          req.type.subBeatDuration,
          req.type.damage
        )
        addComponent(world, eid, Velocity)
        Velocity.x[eid] = Math.cos(angle) * req.type.speed
        Velocity.y[eid] = Math.sin(angle) * req.type.speed
        if (req.type.explosionRadius !== undefined) {
          addComponent(world, eid, ExplosiveProjectile)
          ExplosiveProjectile.explosionRadius[eid] = req.type.explosionRadius
          ExplosiveProjectile.explosionDamage[eid] = req.type.damage
        }
        Name.value[eid] = 'Cloud Projectile'
        break
      }
      case 'explosive-projectile':
        addComponent(world, eid, Position)
        Position.x[eid] = req.x
        Position.y[eid] = req.y
        spawnProjectile(
          world,
          eid,
          req.x,
          req.y,
          req.type.speed,
          req.type.radius,
          req.type.projectileDamage
        )
        addComponent(world, eid, ExplosiveProjectile)
        ExplosiveProjectile.explosionRadius[eid] = req.type.explosionRadius
        ExplosiveProjectile.explosionDamage[eid] = req.type.explosionDamage
        Name.value[eid] = 'Explosive Projectile'
        break
      case 'screen-explosion': {
        for (const e of query(world, [Enemy, Position])) {
          Health.current[e] = (Health.current[e] ?? 0) - req.type.damage
          DamageFlash.startBeat[e] = world.metronome.beat + world.metronome.beatPhase
        }
        spawnExplosion(world, eid, 2000, world.metronome.interval, req.type.damage)
        Name.value[eid] = 'Screen Explosion'
        break
      }
      default: {
        const x: never = req.type
        throw new Error(`Unreachable: ${x}`)
      }
    }
  }
  world.attacks.pending.length = 0
}
