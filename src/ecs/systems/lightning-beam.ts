import { query } from 'bitecs'
import { LightningBeam, Lifetime, Position, Enemy, Health, DamageFlash, Radius } from '../components'
import { isOnBeam } from '../geometry'
import type { World } from '../world'

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

    for (const enemyEid of query(world, [Enemy, Position, Radius])) {
      if (alreadyHit.has(enemyEid)) continue
      const ex = Position.x[enemyEid]!
      const ey = Position.y[enemyEid]!
      const eRadius = Radius.value[enemyEid]!
      if (isOnBeam(px, py, angle, ex, ey, eRadius)) {
        alreadyHit.add(enemyEid)
        Health.current[enemyEid] = (Health.current[enemyEid] ?? 0) - damage
        DamageFlash.startBeat[enemyEid] = world.metronome.beat + world.metronome.beatPhase
        if (spawnExplosion) {
          world.attacks.pending.push({
            type: { tag: 'explosion', radius: 60, damage },
            x: ex,
            y: ey,
            angle: 0,
            targetX: ex,
            targetY: ey,
          })
        }
        if (spawnCloud) {
          world.attacks.pending.push({
            type: { tag: 'cloud', radius: 40, subBeatDuration: 2, damage },
            x: ex,
            y: ey,
            angle: 0,
          })
        }
      }
    }
  }
}
