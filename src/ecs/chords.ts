import { query } from 'bitecs'
import { Enemy, Position, type AttackType } from './components'
import type { ScoreNote } from './music-score'
import type { AttackRequest, World } from './world'

/**
 * Given a set of notes hit within a grace window, resolve them into attack requests.
 * Single notes produce their original attack. Multi-note combinations produce chord attacks.
 */
const pickRandomEnemy = (world: World): { x: number; y: number } | null => {
  const enemies = query(world, [Enemy, Position])
  if (enemies.length === 0) return null
  const eid = enemies[Math.floor(Math.random() * enemies.length)]!
  return { x: Position.x[eid]!, y: Position.y[eid]! }
}

export const resolveChord = (
  notes: ScoreNote[],
  x: number,
  y: number,
  angle: number,
  world: World
): AttackRequest[] => {
  if (notes.length === 0) return []

  const tags = new Set(notes.map(n => n.attackType.tag))

  // Single note — pass through original attack
  if (tags.size === 1) {
    return notes.map(n => ({ type: n.attackType, x, y, angle }))
  }

  const key = [...tags].sort().join('+')

  switch (key) {
    // --- Double chords (Milestone 3) ---
    case 'cloud+lightning': {
      const enemy = pickRandomEnemy(world)
      const l = notes.find(n => n.attackType.tag === 'lightning')!
      const c = notes.find(n => n.attackType.tag === 'cloud')!
      if (!enemy)
        return [
          { type: l.attackType, x, y, angle },
          { type: c.attackType, x, y, angle },
        ]
      return [
        { type: l.attackType, x, y, angle, targetX: enemy.x, targetY: enemy.y },
        { type: c.attackType, x: enemy.x, y: enemy.y, angle },
      ]
    }
    case 'explosion+lightning': {
      const enemy = pickRandomEnemy(world)
      const l = notes.find(n => n.attackType.tag === 'lightning')!
      const e = notes.find(n => n.attackType.tag === 'explosion')!
      if (!enemy)
        return [
          { type: l.attackType, x, y, angle },
          { type: e.attackType, x, y, angle },
        ]
      return [
        { type: l.attackType, x, y, angle, targetX: enemy.x, targetY: enemy.y },
        { type: e.attackType, x, y, angle, targetX: enemy.x, targetY: enemy.y },
      ]
    }
    case 'cloud+explosion':
      return lookupDouble(notes, 'explosion', 'cloud', x, y, angle)

    // --- Double chords producing new attack types (Milestones 4-6) ---
    case 'lightning+projectile':
      return [{ type: beamFromNotes(notes), x, y, angle }]
    case 'cloud+projectile':
      return [{ type: cloudProjectileFromNotes(notes), x, y, angle }]
    case 'explosion+projectile':
      return [{ type: explosiveProjectileFromNotes(notes), x, y, angle }]

    // --- Triple chords (Milestone 7) ---
    case 'cloud+explosion+lightning': {
      const enemy = pickRandomEnemy(world)
      const l = notes.find(n => n.attackType.tag === 'lightning')!
      const c = notes.find(n => n.attackType.tag === 'cloud')!
      const e = notes.find(n => n.attackType.tag === 'explosion')!
      if (!enemy)
        return [
          { type: l.attackType, x, y, angle },
          { type: c.attackType, x, y, angle },
          { type: e.attackType, x, y, angle },
        ]
      return [
        { type: l.attackType, x, y, angle, targetX: enemy.x, targetY: enemy.y },
        { type: c.attackType, x: enemy.x, y: enemy.y, angle },
        { type: e.attackType, x, y, angle, targetX: enemy.x, targetY: enemy.y },
      ]
    }
    case 'cloud+explosion+projectile':
      return [{ type: explosiveCloudProjectileFromNotes(notes), x, y, angle }]
    case 'explosion+lightning+projectile':
      return [{ type: explosiveBeamFromNotes(notes), x, y, angle }]
    case 'cloud+lightning+projectile':
      return [{ type: cloudBeamFromNotes(notes), x, y, angle }]

    // --- Grand chord (Milestone 8) ---
    case 'cloud+explosion+lightning+projectile':
      return [{ type: { tag: 'screen-explosion', damage: totalDamage(notes) }, x, y, angle }]

    default:
      // Fallback: fire each note individually
      return notes.map(n => ({ type: n.attackType, x, y, angle }))
  }
}

/** For double chords that just combine two existing attacks */
const lookupDouble = (
  notes: ScoreNote[],
  tagA: AttackType['tag'],
  tagB: AttackType['tag'],
  x: number,
  y: number,
  angle: number
): AttackRequest[] => {
  const a = notes.find(n => n.attackType.tag === tagA)!
  const b = notes.find(n => n.attackType.tag === tagB)!
  return [
    { type: a.attackType, x, y, angle },
    { type: b.attackType, x, y, angle },
  ]
}

const totalDamage = (notes: ScoreNote[]): number =>
  notes.reduce(
    (sum, n) => sum + ('damage' in n.attackType ? (n.attackType as { damage: number }).damage : 0),
    0
  )

const beamFromNotes = (notes: ScoreNote[]): AttackType => ({
  tag: 'lightning-beam',
  damage: totalDamage(notes),
  subBeatDuration: 2,
})

const explosiveBeamFromNotes = (notes: ScoreNote[]): AttackType => ({
  tag: 'lightning-beam',
  damage: totalDamage(notes),
  subBeatDuration: 2,
  spawnExplosionOnHit: true,
})

const cloudBeamFromNotes = (notes: ScoreNote[]): AttackType => ({
  tag: 'lightning-beam',
  damage: totalDamage(notes),
  subBeatDuration: 2,
  spawnCloudOnHit: true,
})

const cloudProjectileFromNotes = (notes: ScoreNote[]): AttackType => {
  const cloud = notes.find(n => n.attackType.tag === 'cloud')
  const proj = notes.find(n => n.attackType.tag === 'projectile')
  return {
    tag: 'cloud-projectile',
    speed: proj?.attackType.tag === 'projectile' ? proj.attackType.speed : 300,
    radius: cloud?.attackType.tag === 'cloud' ? cloud.attackType.radius : 40,
    subBeatDuration: cloud?.attackType.tag === 'cloud' ? cloud.attackType.subBeatDuration : 2,
    damage: totalDamage(notes),
  }
}

const explosiveProjectileFromNotes = (notes: ScoreNote[]): AttackType => {
  const proj = notes.find(n => n.attackType.tag === 'projectile')
  const expl = notes.find(n => n.attackType.tag === 'explosion')
  return {
    tag: 'explosive-projectile',
    speed: proj?.attackType.tag === 'projectile' ? proj.attackType.speed : 300,
    radius: proj?.attackType.tag === 'projectile' ? proj.attackType.radius : 8,
    explosionRadius: expl?.attackType.tag === 'explosion' ? expl.attackType.radius : 60,
    projectileDamage: proj?.attackType.tag === 'projectile' ? proj.attackType.damage : 3,
    explosionDamage: expl?.attackType.tag === 'projectile' ? expl.attackType.damage : 3,
  }
}

const explosiveCloudProjectileFromNotes = (notes: ScoreNote[]): AttackType => {
  const proj = notes.find(n => n.attackType.tag === 'projectile')
  const cloud = notes.find(n => n.attackType.tag === 'cloud')
  const expl = notes.find(n => n.attackType.tag === 'explosion')
  return {
    tag: 'cloud-projectile',
    speed: proj?.attackType.tag === 'projectile' ? proj.attackType.speed : 300,
    radius: cloud?.attackType.tag === 'cloud' ? cloud.attackType.radius : 40,
    subBeatDuration: cloud?.attackType.tag === 'cloud' ? cloud.attackType.subBeatDuration : 2,
    damage: totalDamage(notes),
    explosionRadius: expl?.attackType.tag === 'explosion' ? expl.attackType.radius : 60,
  }
}
