import { query } from 'bitecs'
import { Position, Velocity, Swarmer, Player } from '../components'
import type { World } from '../world'

const COHESION_WEIGHT = 0.3
const SEPARATION_WEIGHT = 1.5
const CHASE_WEIGHT = 1.0
const SEPARATION_RADIUS = 30
const SEPARATION_RADIUS_SQ = SEPARATION_RADIUS * SEPARATION_RADIUS

export const swarmerSystem = (world: World) => {
  const swarmers = query(world, [Position, Velocity, Swarmer])
  if (swarmers.length === 0) return

  const playerEid = query(world, [Player, Position])[0]
  if (playerEid === undefined) return
  const px = Position.x[playerEid]!
  const py = Position.y[playerEid]!

  // Group swarmers by groupId
  const groups = new Map<number, number[]>()
  for (const eid of swarmers) {
    const gid = Swarmer.groupId[eid]!
    let arr = groups.get(gid)
    if (arr === undefined) {
      arr = []
      groups.set(gid, arr)
    }
    arr.push(eid)
  }

  for (const members of groups.values()) {
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
      const speed = Swarmer.speed[eid]!

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
        if (distSq < SEPARATION_RADIUS_SQ && distSq > 0) {
          const dist = Math.sqrt(distSq)
          sepX += (dx / dist) * (1 - dist / SEPARATION_RADIUS)
          sepY += (dy / dist) * (1 - dist / SEPARATION_RADIUS)
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
      let vx = cohX * COHESION_WEIGHT + sepX * SEPARATION_WEIGHT + chaseX * CHASE_WEIGHT
      let vy = cohY * COHESION_WEIGHT + sepY * SEPARATION_WEIGHT + chaseY * CHASE_WEIGHT
      const mag = Math.sqrt(vx * vx + vy * vy)
      if (mag > 0) {
        Velocity.x[eid] = (vx / mag) * speed
        Velocity.y[eid] = (vy / mag) * speed
      }
    }
  }
}
