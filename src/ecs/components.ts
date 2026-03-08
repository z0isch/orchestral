import { createRelation, makeExclusive } from 'bitecs'
import z from 'zod'

type Arrayed<T> = { [K in keyof T]: T[K][] }

export const positionSchema = z.object({ x: z.number(), y: z.number() })
export type PositionComponent = z.infer<typeof positionSchema>

export const velocitySchema = z.object({ x: z.number(), y: z.number() })
export type VelocityComponent = z.infer<typeof velocitySchema>

export const dashSchema = z.object({ vx: z.number(), vy: z.number(), remaining: z.number() })
export type DashComponent = z.infer<typeof dashSchema>

export const playerSchema = z.object({ facing: z.number() })
export type PlayerComponent = z.infer<typeof playerSchema>

export const enemySchema = z.object({})
export type EnemyComponent = z.infer<typeof enemySchema>

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
export type BeatMovementComponent = z.infer<typeof beatMovementSchema>

export const projectileSchema = z.object({ radius: z.number() })
export type ProjectileComponent = z.infer<typeof projectileSchema>

export const healthSchema = z.object({ current: z.number(), max: z.number() })
export type HealthComponent = z.infer<typeof healthSchema>

export const damageSchema = z.object({ amount: z.number() })
export type DamageComponent = z.infer<typeof damageSchema>

export const explosionSchema = z.object({
  radius: z.number(),
  duration: z.number(),
  alreadyHit: z.set(z.number()),
})
export type ExplosionComponent = z.infer<typeof explosionSchema>

export const lightningSchema = z.object({
  targetX: z.number(),
  targetY: z.number(),
  duration: z.number(),
})
export type LightningComponent = z.infer<typeof lightningSchema>

export const cloudSchema = z.object({
  radius: z.number(),
  duration: z.number(),
  subBeatInterval: z.number(),
  subBeatTimer: z.number(),
  alreadyHitThisSubbeat: z.set(z.number()),
})
export type CloudComponent = z.infer<typeof cloudSchema>

export const lightningBeamSchema = z.object({
  originEid: z.number(),
  angle: z.number(),
  damage: z.number(),
  alreadyHit: z.set(z.number()),
  duration: z.number(),
  spawnExplosionOnHit: z.number(),
  spawnCloudOnHit: z.number(),
})
export type LightningBeamComponent = z.infer<typeof lightningBeamSchema>

export const explosiveProjectileSchema = z.object({
  explosionRadius: z.number(),
  explosionDamage: z.number(),
})
export type ExplosiveProjectileComponent = z.infer<typeof explosiveProjectileSchema>

export const lifetimeSchema = z.object({ remaining: z.number() })
export type LifetimeComponent = z.infer<typeof lifetimeSchema>

export const damageFlashSchema = z.object({ startBeat: z.number() })
export type DamageFlashComponent = z.infer<typeof damageFlashSchema>

export const radiusSchema = z.object({ value: z.number() })
export type RadiusComponent = z.infer<typeof radiusSchema>

export const swarmerSchema = z.object({})
export type SwarmerComponent = z.infer<typeof swarmerSchema>

export const swarmConfigSchema = z.object({
  cohesionWeight: z.number(),
  separationWeight: z.number(),
  chaseWeight: z.number(),
  separationRadius: z.number(),
  speed: z.number(),
})
export type SwarmConfigComponent = z.infer<typeof swarmConfigSchema>

export const nameSchema = z.object({ value: z.string() })
export type NameComponent = z.infer<typeof nameSchema>

export const Targeting = createRelation(makeExclusive)
export const BelongsToSwarm = createRelation(makeExclusive)

export const allComponents = {
  position: { store: { x: [], y: [] } as Arrayed<PositionComponent>, schema: positionSchema },
  velocity: { store: { x: [], y: [] } as Arrayed<VelocityComponent>, schema: velocitySchema },
  dash: { store: { vx: [], vy: [], remaining: [] } as Arrayed<DashComponent>, schema: dashSchema },
  player: { store: { facing: [] } as Arrayed<PlayerComponent>, schema: playerSchema },
  enemy: { store: {} as Arrayed<EnemyComponent>, schema: enemySchema },
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
    } as Arrayed<BeatMovementComponent>,
    schema: beatMovementSchema,
  },
  projectile: { store: { radius: [] } as Arrayed<ProjectileComponent>, schema: projectileSchema },
  health: { store: { current: [], max: [] } as Arrayed<HealthComponent>, schema: healthSchema },
  damage: { store: { amount: [] } as Arrayed<DamageComponent>, schema: damageSchema },
  explosion: {
    store: { radius: [], duration: [], alreadyHit: [] } as Arrayed<ExplosionComponent>,
    schema: explosionSchema,
  },
  lightning: {
    store: { targetX: [], targetY: [], duration: [] } as Arrayed<LightningComponent>,
    schema: lightningSchema,
  },
  cloud: {
    store: {
      radius: [],
      duration: [],
      subBeatInterval: [],
      subBeatTimer: [],
      alreadyHitThisSubbeat: [],
    } as Arrayed<CloudComponent>,
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
    } as Arrayed<LightningBeamComponent>,
    schema: lightningBeamSchema,
  },
  explosiveProjectile: {
    store: { explosionRadius: [], explosionDamage: [] } as Arrayed<ExplosiveProjectileComponent>,
    schema: explosiveProjectileSchema,
  },
  lifetime: { store: { remaining: [] } as Arrayed<LifetimeComponent>, schema: lifetimeSchema },
  radius: { store: { value: [] } as Arrayed<RadiusComponent>, schema: radiusSchema },
  swarmer: { store: {} as Arrayed<SwarmerComponent>, schema: swarmerSchema },
  swarmConfig: {
    store: {
      cohesionWeight: [],
      separationWeight: [],
      chaseWeight: [],
      separationRadius: [],
      speed: [],
    } as Arrayed<SwarmConfigComponent>,
    schema: swarmConfigSchema,
  },
  damageFlash: {
    store: { startBeat: [] } as Arrayed<DamageFlashComponent>,
    schema: damageFlashSchema,
  },
  name: { store: { value: [] as string[] } as Arrayed<NameComponent>, schema: nameSchema },
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
export const Radius = allComponents.radius.store
export const Swarmer = allComponents.swarmer.store
export const SwarmConfig = allComponents.swarmConfig.store
export const DamageFlash = allComponents.damageFlash.store
export const Name = allComponents.name.store

export const DEFAULT_PLAYER_RADIUS = 20
export const DEFAULT_ENEMY_RADIUS = 20
export const DEFAULT_SWARMER_RADIUS = 8
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
