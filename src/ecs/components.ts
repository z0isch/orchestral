import { createRelation, makeExclusive } from 'bitecs'
import z from 'zod'

type Arrayed<T> = { [K in keyof T]: T[K][] }

export const positionSchema = z.object({ x: z.number(), y: z.number() })
export type Position = z.infer<typeof positionSchema>

export const velocitySchema = z.object({ x: z.number(), y: z.number() })
export type Velocity = z.infer<typeof velocitySchema>

export const dashSchema = z.object({ vx: z.number(), vy: z.number(), remaining: z.number() })
export type Dash = z.infer<typeof dashSchema>

export const playerSchema = z.object({ facing: z.number() })
export type Player = z.infer<typeof playerSchema>

export const enemySchema = z.object({})
export type Enemy = z.infer<typeof enemySchema>

export const beatMovementSchema = z.object({
  distance: z.number(),
  cadence: z.number(),
  overSubBeats: z.number(),
  moveEndSubBeat: z.number(),
  lastMoveEndSubBeat: z.number(),
  aimLeadSubBeats: z.number(),
  targetX: z.number(),
  targetY: z.number(),
})
export type BeatMovement = z.infer<typeof beatMovementSchema>

export const projectileSchema = z.object({ radius: z.number() })
export type Projectile = z.infer<typeof projectileSchema>

export const healthSchema = z.object({ current: z.number(), max: z.number() })
export type Health = z.infer<typeof healthSchema>

export const damageSchema = z.object({ amount: z.number() })
export type Damage = z.infer<typeof damageSchema>

export const explosionSchema = z.object({
  radius: z.number(),
  duration: z.number(),
  alreadyHit: z.set(z.number()),
})
export type Explosion = z.infer<typeof explosionSchema>

export const lightningSchema = z.object({
  targetX: z.number(),
  targetY: z.number(),
  duration: z.number(),
})
export type Lightning = z.infer<typeof lightningSchema>

export const cloudSchema = z.object({
  radius: z.number(),
  duration: z.number(),
  subBeatInterval: z.number(),
  subBeatTimer: z.number(),
  alreadyHitThisSubbeat: z.set(z.number()),
})
export type Cloud = z.infer<typeof cloudSchema>

export const lightningBeamSchema = z.object({
  originEid: z.number(),
  angle: z.number(),
  damage: z.number(),
  alreadyHit: z.set(z.number()),
  duration: z.number(),
  spawnExplosionOnHit: z.number(),
  spawnCloudOnHit: z.number(),
})
export type LightningBeam = z.infer<typeof lightningBeamSchema>

export const explosiveProjectileSchema = z.object({
  explosionRadius: z.number(),
  explosionDamage: z.number(),
})
export type ExplosiveProjectile = z.infer<typeof explosiveProjectileSchema>

export const lifetimeSchema = z.object({ remaining: z.number() })
export type Lifetime = z.infer<typeof lifetimeSchema>

export const damageFlashSchema = z.object({ startBeat: z.number() })
export type DamageFlash = z.infer<typeof damageFlashSchema>

export const nameSchema = z.object({ value: z.string() })
export type Name = z.infer<typeof nameSchema>

export const Targeting = createRelation(makeExclusive)

export const allComponents = {
  position: { store: { x: [], y: [] } as Arrayed<Position>, schema: positionSchema },
  velocity: { store: { x: [], y: [] } as Arrayed<Velocity>, schema: velocitySchema },
  dash: { store: { vx: [], vy: [], remaining: [] } as Arrayed<Dash>, schema: dashSchema },
  player: { store: { facing: [] } as Arrayed<Player>, schema: playerSchema },
  enemy: { store: {} as Arrayed<Enemy>, schema: enemySchema },
  beatMovement: {
    store: {
      distance: [],
      cadence: [],
      overSubBeats: [],
      moveEndSubBeat: [],
      lastMoveEndSubBeat: [],
      aimLeadSubBeats: [],
      targetX: [],
      targetY: [],
    } as Arrayed<BeatMovement>,
    schema: beatMovementSchema,
  },
  projectile: { store: { radius: [] } as Arrayed<Projectile>, schema: projectileSchema },
  health: { store: { current: [], max: [] } as Arrayed<Health>, schema: healthSchema },
  damage: { store: { amount: [] } as Arrayed<Damage>, schema: damageSchema },
  explosion: {
    store: { radius: [], duration: [], alreadyHit: [] } as Arrayed<Explosion>,
    schema: explosionSchema,
  },
  lightning: {
    store: { targetX: [], targetY: [], duration: [] } as Arrayed<Lightning>,
    schema: lightningSchema,
  },
  cloud: {
    store: {
      radius: [],
      duration: [],
      subBeatInterval: [],
      subBeatTimer: [],
      alreadyHitThisSubbeat: [],
    } as Arrayed<Cloud>,
    schema: cloudSchema,
  },
  lightningBeam: {
    store: {
      originEid: [],
      angle: [],
      damage: [],
      alreadyHit: [],
      duration: [],
      spawnExplosionOnHit: [],
      spawnCloudOnHit: [],
    } as Arrayed<LightningBeam>,
    schema: lightningBeamSchema,
  },
  explosiveProjectile: {
    store: { explosionRadius: [], explosionDamage: [] } as Arrayed<ExplosiveProjectile>,
    schema: explosiveProjectileSchema,
  },
  lifetime: { store: { remaining: [] } as Arrayed<Lifetime>, schema: lifetimeSchema },
  damageFlash: { store: { startBeat: [] } as Arrayed<DamageFlash>, schema: damageFlashSchema },
  name: { store: { value: [] as string[] } as Arrayed<Name>, schema: nameSchema },
}
export type AllComponents = typeof allComponents

export const Position = allComponents.position.store
export const Velocity = allComponents.velocity.store
export const Dash = allComponents.dash.store
export const Player = allComponents.player.store
export const Enemy = allComponents.enemy.store
export const BeatMovement = allComponents.beatMovement.store
export const Projectile = allComponents.projectile.store
export const Health = allComponents.health.store
export const Damage = allComponents.damage.store
export const Explosion = allComponents.explosion.store
export const Lightning = allComponents.lightning.store
export const Cloud = allComponents.cloud.store
export const LightningBeam = allComponents.lightningBeam.store
export const ExplosiveProjectile = allComponents.explosiveProjectile.store
export const Lifetime = allComponents.lifetime.store
export const DamageFlash = allComponents.damageFlash.store
export const Name = allComponents.name.store

export const PLAYER_RADIUS = 20
export type AttackType =
  | { tag: 'projectile'; speed: number; radius: number; damage: number }
  | { tag: 'explosion'; radius: number; damage: number }
  | { tag: 'lightning'; damage: number }
  | { tag: 'cloud'; radius: number; subBeatDuration: number; damage: number }
  | {
      tag: 'lightning-beam'
      damage: number
      subBeatDuration: number
      spawnExplosionOnHit?: boolean
      spawnCloudOnHit?: boolean
    }
  | {
      tag: 'cloud-projectile'
      speed: number
      radius: number
      subBeatDuration: number
      damage: number
      explosionRadius?: number
    }
  | {
      tag: 'explosive-projectile'
      speed: number
      radius: number
      explosionRadius: number
      projectileDamage: number
      explosionDamage: number
    }
  | { tag: 'screen-explosion'; damage: number }
