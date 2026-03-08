import { query, Pair } from 'bitecs'
import { Position, Velocity, Player, SwarmConfig, BelongsToSwarm } from '../components'
import type { World } from '../world'

export const swarmerSystem = (world: World) => {
  const swarmParents = query(world, [SwarmConfig])
  if (swarmParents.length === 0) return

  const playerEid = query(world, [Player, Position])[0]
  if (playerEid === undefined) return
  const px = Position.x[playerEid]!
  const py = Position.y[playerEid]!

  for (const swarmEid of swarmParents) {
    const members = query(world, [Pair(BelongsToSwarm, swarmEid), Position, Velocity])
    if (members.length === 0) continue

    const cohesionWeight = SwarmConfig.cohesionWeight[swarmEid]!
    const separationWeight = SwarmConfig.separationWeight[swarmEid]!
    const chaseWeight = SwarmConfig.chaseWeight[swarmEid]!
    const separationRadius = SwarmConfig.separationRadius[swarmEid]!
    const separationRadiusSq = separationRadius * separationRadius
    const speed = SwarmConfig.speed[swarmEid]!

    // Compute centroid
    let cx = 0
    let cy = 0
    for (const eid of members) {
      cx += Position.x[eid]!
      cy += Position.y[eid]!
    }
    cx /= members.length
    cy /= members.length

    for (const eid of members) {
      const ex = Position.x[eid]!
      const ey = Position.y[eid]!

      // Cohesion: steer toward group centroid
      let cohX = cx - ex
      let cohY = cy - ey
      const cohDist = Math.sqrt(cohX * cohX + cohY * cohY)
      if (cohDist > 0) {
        cohX /= cohDist
        cohY /= cohDist
      }

      // Separation: repel from nearby swarmers
      let sepX = 0
      let sepY = 0
      for (const other of members) {
        if (other === eid) continue
        const dx = ex - Position.x[other]!
        const dy = ey - Position.y[other]!
        const distSq = dx * dx + dy * dy
        if (distSq < separationRadiusSq && distSq > 0) {
          const dist = Math.sqrt(distSq)
          sepX += (dx / dist) * (1 - dist / separationRadius)
          sepY += (dy / dist) * (1 - dist / separationRadius)
        }
      }

      // Chase: steer toward player
      let chaseX = px - ex
      let chaseY = py - ey
      const chaseDist = Math.sqrt(chaseX * chaseX + chaseY * chaseY)
      if (chaseDist > 0) {
        chaseX /= chaseDist
        chaseY /= chaseDist
      }

      // Blend and normalize to constant speed
      let vx = cohX * cohesionWeight + sepX * separationWeight + chaseX * chaseWeight
      let vy = cohY * cohesionWeight + sepY * separationWeight + chaseY * chaseWeight
      const mag = Math.sqrt(vx * vx + vy * vy)
      if (mag > 0) {
        Velocity.x[eid] = (vx / mag) * speed
        Velocity.y[eid] = (vy / mag) * speed
      }
    }
  }
}
