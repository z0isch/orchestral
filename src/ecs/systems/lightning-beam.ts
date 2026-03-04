import { query } from 'bitecs'
import { LightningBeam, Lifetime, Position, Enemy, Health, DamageFlash } from '../components'
import { ENEMY_RADIUS } from './enemy-player-collision'
import type { World } from '../world'

const isOnBeam = (px: number, py: number, angle: number, ex: number, ey: number): boolean => {
  const dx = ex - px
  const dy = ey - py
  const dot = dx * Math.cos(angle) + dy * Math.sin(angle)
  if (dot < 0) return false
  const perpSq = dx * dx + dy * dy - dot * dot
  return perpSq < ENEMY_RADIUS * ENEMY_RADIUS
}

export const lightningBeamSystem = (world: World) => {
  for (const eid of query(world, [LightningBeam, Lifetime])) {
    const originEid = LightningBeam.originEid[eid]!
    const px = Position.x[originEid]!
    const py = Position.y[originEid]!
    const angle = LightningBeam.angle[eid]!
    const damage = LightningBeam.damage[eid]!
    const alreadyHit = LightningBeam.alreadyHit[eid]!

    const spawnExplosion = LightningBeam.spawnExplosionOnHit[eid] === 1
    const spawnCloud = LightningBeam.spawnCloudOnHit[eid] === 1

    for (const enemyEid of query(world, [Enemy, Position])) {
      if (alreadyHit.has(enemyEid)) continue
      const ex = Position.x[enemyEid]!
      const ey = Position.y[enemyEid]!
      if (isOnBeam(px, py, angle, ex, ey)) {
        alreadyHit.add(enemyEid)
        Health.current[enemyEid] = (Health.current[enemyEid] ?? 0) - damage
        DamageFlash.startBeat[enemyEid] = world.metronome.beat + world.metronome.beatPhase
        if (spawnExplosion) {
          world.attacks.pending.push({
            type: { tag: 'explosion', radius: 60, damage },
            x: ex, y: ey, angle: 0,
            targetX: ex, targetY: ey,
          })
        }
        if (spawnCloud) {
          world.attacks.pending.push({
            type: { tag: 'cloud', radius: 40, subBeatDuration: 2, damage },
            x: ex, y: ey, angle: 0,
          })
        }
      }
    }
  }
}
