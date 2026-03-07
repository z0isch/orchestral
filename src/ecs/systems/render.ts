import { query } from 'bitecs'
import {
  Position,
  Projectile,
  Enemy,
  Player,
  Dash,
  Explosion,
  Lightning,
  LightningBeam,
  Cloud,
  Lifetime,
  Health,
  PLAYER_RADIUS,
  DamageFlash,
  BeatMovement,
} from '../components'
import { ENEMY_RADIUS } from './enemy-player-collision'
import type { World } from '../world'

const PROJECTILE_COLOR = '#aaccff'
import { BUTTON_COLORS, BUTTON_LABELS } from '../../score-editor/types'
const LOOK_AHEAD_BEATS = 4
const HIGHWAY_H = 300
const HIGHWAY_W = 200

export const createRenderSystem = (ctx: CanvasRenderingContext2D) => (world: World) => {
  const { score, metronome, gamepad } = world
  const W = ctx.canvas.width
  const H = ctx.canvas.height
  const playerEid = query(world, [Player, Position])[0]

  ctx.clearRect(0, 0, W, H)

  // ==== Floor (world-space, drawn first so everything renders on top) ====
  {
    ctx.save()
    ctx.translate(W / 2 - world.camera.x, H / 2 - world.camera.y)

    // Clip floor to world bounds (the arena walls)
    ctx.beginPath()
    ctx.rect(0, 0, W, H)
    ctx.clip()

    const TILE = 80
    const vLeft = world.camera.x - W / 2
    const vRight = world.camera.x + W / 2
    const vTop = world.camera.y - H / 2
    const vBottom = world.camera.y + H / 2
    const startX = Math.floor(vLeft / TILE) * TILE
    const startY = Math.floor(vTop / TILE) * TILE

    // Subtle checkerboard tiles
    for (let x = startX; x < vRight + TILE; x += TILE) {
      for (let y = startY; y < vBottom + TILE; y += TILE) {
        const col = Math.round(x / TILE)
        const row = Math.round(y / TILE)
        ctx.fillStyle = (col + row) % 2 === 0 ? '#07070f' : '#0a0a15'
        ctx.fillRect(x, y, TILE, TILE)
      }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(60, 80, 160, 0.22)'
    ctx.lineWidth = 1
    for (let x = startX; x <= vRight + TILE; x += TILE) {
      ctx.beginPath()
      ctx.moveTo(x, vTop - TILE)
      ctx.lineTo(x, vBottom + TILE)
      ctx.stroke()
    }
    for (let y = startY; y <= vBottom + TILE; y += TILE) {
      ctx.beginPath()
      ctx.moveTo(vLeft - TILE, y)
      ctx.lineTo(vRight + TILE, y)
      ctx.stroke()
    }

    // Intersection dots (most visible movement cue)
    for (let x = startX; x <= vRight + TILE; x += TILE) {
      for (let y = startY; y <= vBottom + TILE; y += TILE) {
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(90, 110, 200, 0.45)'
        ctx.fill()
      }
    }

    ctx.restore()
  }

  // ==== Game Over Screen ====
  if (world.gameOver) {
    const { reason, points } = world.gameOver

    // Dim background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.textAlign = 'center'

    // Title
    ctx.font = 'bold 64px sans-serif'
    ctx.fillStyle = reason === 'survived' ? '#33cc33' : '#ff3355'
    ctx.fillText(reason === 'survived' ? 'YOU SURVIVED!' : 'GAME OVER', W / 2, H / 2 - 80)

    // Subtitle
    ctx.font = '24px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.fillText(
      reason === 'survived' ? 'You made it through the full song!' : 'You ran out of hearts!',
      W / 2,
      H / 2 - 30
    )

    // Score
    ctx.font = 'bold 36px sans-serif'
    ctx.fillStyle = 'white'
    ctx.fillText(`Score: ${points}`, W / 2, H / 2 + 40)

    // Note hits
    ctx.font = '22px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.fillText(`Notes hit: ${score.hits}`, W / 2, H / 2 + 80)

    ctx.restore()
    return
  }

  // ==== Highway ====
  if (metronome.beat >= 0) {
    const uniqueButtons = [0, 1, 2, 3]

    {
      const laneCount = uniqueButtons.length
      // With camera centering the player, player always renders at screen center
      const playerX = W / 2
      const playerY = H / 2
      const hitLineY = playerY - 50
      const highwayTop = hitLineY - HIGHWAY_H
      const topScale = 0.2
      const cx = playerX

      const perspX = (laneRatio: number, y: number): number => {
        const p = (y - highwayTop) / HIGHWAY_H
        const sc = topScale + (1 - topScale) * p
        return cx + (laneRatio - 0.5) * HIGHWAY_W * sc
      }

      const blX = cx - HIGHWAY_W / 2
      const brX = cx + HIGHWAY_W / 2

      // -- Trapezoid + clipped contents--
      ctx.save()

      ctx.beginPath()
      ctx.moveTo(perspX(0, highwayTop), highwayTop)
      ctx.lineTo(perspX(1, highwayTop), highwayTop)
      ctx.lineTo(brX, hitLineY)
      ctx.lineTo(blX, hitLineY)
      ctx.closePath()

      // Solid base to block the floor pattern, then gradient overlay
      ctx.fillStyle = '#07070f'
      ctx.fill()
      ctx.globalAlpha = 0.3
      const bgGrad = ctx.createLinearGradient(0, highwayTop, 0, hitLineY)
      bgGrad.addColorStop(0, '#060610')
      bgGrad.addColorStop(1, '#0e0e1c')
      ctx.fillStyle = bgGrad
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.clip()

      // Lane dividers
      for (let i = 1; i < laneCount; i++) {
        const ratio = i / laneCount
        ctx.beginPath()
        ctx.moveTo(perspX(ratio, highwayTop), highwayTop)
        ctx.lineTo(perspX(ratio, hitLineY), hitLineY)
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Scrolling beat/sub-beat grid lines
      const currentPos = metronome.beat + metronome.beatPhase
      const subSize = 1 / metronome.subdivisions
      const firstSub = Math.ceil(currentPos / subSize) * subSize
      for (let t = firstSub; t - currentPos <= LOOK_AHEAD_BEATS; t += subSize) {
        const timeUntil = t - currentPos
        const y = hitLineY - (timeUntil / LOOK_AHEAD_BEATS) * HIGHWAY_H
        const isBeat = Math.abs(t - Math.round(t)) < 0.005
        ctx.beginPath()
        ctx.moveTo(perspX(0, y), y)
        ctx.lineTo(perspX(1, y), y)
        ctx.strokeStyle = isBeat ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'
        ctx.lineWidth = isBeat ? 1.5 : 0.5
        ctx.stroke()
      }

      // Notes
      const { loopBeats, introBeats, notes } = score.data
      const futurePasses = Math.ceil(LOOK_AHEAD_BEATS / loopBeats) + 1
      for (const note of notes) {
        const notePosInLoop = note.beat + note.subBeat / metronome.subdivisions
        const firstOccurrence = introBeats + notePosInLoop
        const loopsSinceFirst = Math.max(0, Math.floor((currentPos - firstOccurrence) / loopBeats))
        let baseAbsPos = firstOccurrence + loopsSinceFirst * loopBeats
        const noteDurationBeats = note.durationSubBeats / metronome.subdivisions
        while (
          baseAbsPos + noteDurationBeats <
          currentPos - world.score.graceS / metronome.interval
        )
          baseAbsPos += loopBeats

        for (let pass = 0; pass <= futurePasses; pass++) {
          const timeUntil = baseAbsPos + pass * loopBeats - currentPos
          if (timeUntil > LOOK_AHEAD_BEATS) break

          const laneIdx = uniqueButtons.indexOf(note.button)
          if (laneIdx < 0) continue

          // For sustained notes, keep rendering while the tail is still above the hit line
          const endTimeUntil = timeUntil + noteDurationBeats
          if (endTimeUntil < 0) continue

          const rawNoteY = hitLineY - (timeUntil / LOOK_AHEAD_BEATS) * HIGHWAY_H
          const noteY = Math.min(rawNoteY, hitLineY)
          if (noteY < highwayTop) continue

          const laneRatio = (laneIdx + 0.5) / laneCount
          const noteX = perspX(laneRatio, noteY)
          const pf = topScale + (1 - topScale) * ((noteY - highwayTop) / HIGHWAY_H)
          const noteR = Math.min(28, (HIGHWAY_W / laneCount) * 0.4) * pf
          const color = BUTTON_COLORS[note.button % BUTTON_COLORS.length]!

          const cooldownEntry = score.noteCooldowns.get(note)
          const beatsRemainingOnCooldown =
            cooldownEntry !== undefined
              ? cooldownEntry.cooldown - (currentPos - cooldownEntry.beat)
              : 0
          const onCooldown = beatsRemainingOnCooldown > 0 && beatsRemainingOnCooldown > timeUntil
          const isHeld = timeUntil <= 0 && score.sustainedHolds.has(note)

          ctx.save()
          ctx.globalAlpha = isHeld ? 0.3 : onCooldown ? 0.05 : 0.3

          if (note.durationSubBeats > 1) {
            // Sustained note: draw perspective-corrected capsule (trapezoid + rounded ends)
            const endY = Math.max(
              highwayTop,
              hitLineY - (endTimeUntil / LOOK_AHEAD_BEATS) * HIGHWAY_H
            )
            const pfEnd = topScale + (1 - topScale) * ((endY - highwayTop) / HIGHWAY_H)
            const endR = Math.min(28, (HIGHWAY_W / laneCount) * 0.4) * pfEnd
            const endX = perspX(laneRatio, endY)

            // Capsule: single path combining tail arc, trapezoid sides, and head arc
            ctx.beginPath()
            ctx.arc(endX, endY, endR, Math.PI, 0) // tail semicircle (top)
            ctx.lineTo(noteX + noteR, noteY) // right side down
            ctx.arc(noteX, noteY, noteR, 0, Math.PI) // head semicircle (bottom)
            ctx.lineTo(endX - endR, endY) // left side up
            ctx.closePath()
            ctx.fillStyle = color
            ctx.fill()
            ctx.strokeStyle = 'rgba(255,255,255,0.7)'
            ctx.lineWidth = Math.max(1, 2 * pf)
            ctx.stroke()
          } else {
            // Quarter note: existing circle rendering
            const glow = ctx.createRadialGradient(noteX, noteY, 0, noteX, noteY, noteR * 2.5)
            glow.addColorStop(0, color + 'aa')
            glow.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = glow
            ctx.beginPath()
            ctx.arc(noteX, noteY, noteR * 2.5, 0, Math.PI * 2)
            ctx.fill()

            ctx.beginPath()
            ctx.arc(noteX, noteY, noteR, 0, Math.PI * 2)
            ctx.fillStyle = color
            ctx.fill()
            ctx.strokeStyle = 'rgba(255,255,255,0.7)'
            ctx.lineWidth = Math.max(1, 2 * pf)
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(noteX - noteR * 0.3, noteY - noteR * 0.3, noteR * 0.3, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(255,255,255,0.45)'
            ctx.fill()
          }

          const label = BUTTON_LABELS[note.button % BUTTON_LABELS.length] ?? ''
          if (label) {
            ctx.font = `bold ${Math.round(noteR * 1.1)}px sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = 'rgba(255,255,255,0.9)'
            ctx.fillText(label, noteX, noteY)
          }

          ctx.restore()
        }
      }

      ctx.restore()

      // -- Hit zone (outside clip) --
      ctx.save()
      ctx.globalAlpha = 0.3

      const lineGrad = ctx.createLinearGradient(blX, 0, brX, 0)
      lineGrad.addColorStop(0, 'transparent')
      lineGrad.addColorStop(0.03, 'rgba(255,255,255,0.9)')
      lineGrad.addColorStop(0.97, 'rgba(255,255,255,0.9)')
      lineGrad.addColorStop(1, 'transparent')
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(blX, hitLineY)
      ctx.lineTo(brX, hitLineY)
      ctx.stroke()

      const targetR = Math.min(28, (HIGHWAY_W / laneCount) * 0.4)
      for (let i = 0; i < laneCount; i++) {
        const btn = uniqueButtons[i]!
        const targetX = perspX((i + 0.5) / laneCount, hitLineY)
        const color = BUTTON_COLORS[btn % BUTTON_COLORS.length]!
        const pressed = gamepad.buttons[btn] ?? false

        if (pressed) {
          const flash = ctx.createRadialGradient(
            targetX,
            hitLineY,
            0,
            targetX,
            hitLineY,
            targetR * 3.5
          )
          flash.addColorStop(0, color + 'cc')
          flash.addColorStop(0.4, color + '44')
          flash.addColorStop(1, 'transparent')
          ctx.fillStyle = flash
          ctx.beginPath()
          ctx.arc(targetX, hitLineY, targetR * 3.5, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(targetX, hitLineY, targetR, 0, Math.PI * 2)
        ctx.fillStyle = pressed ? color : color + '22'
        ctx.fill()
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.stroke()

        const label = BUTTON_LABELS[btn % BUTTON_LABELS.length] ?? ''
        if (label) {
          ctx.font = `bold ${Math.round(targetR * 1.1)}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = pressed ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)'
          ctx.fillText(label, targetX, hitLineY)
        }
      }

      ctx.restore()
    }
  }

  // ==== Points & Combo HUD (anchored to highway) ====
  if (playerEid !== undefined) {
    const playerX = W / 2
    const playerY = H / 2 - PLAYER_RADIUS + 100
    const hudX = playerX + HIGHWAY_W / 2 + 20
    const hudY = playerY - HIGHWAY_H / 2
    ctx.save()
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(`${score.points}`, hudX, hudY)
    if (score.combo > 0) {
      ctx.font = 'bold 20px sans-serif'
      ctx.fillStyle = score.combo >= 10 ? '#ffcc00' : 'rgba(255,255,255,0.7)'
      ctx.fillText(`x${score.combo}`, hudX, hudY + 28)
    }
    ctx.restore()

    // ==== Hearts HUD ====
    const { player } = world
    const heartX = playerX - HIGHWAY_W / 2 - 20
    const heartY = playerY - HIGHWAY_H / 2
    ctx.save()
    ctx.font = 'bold 26px sans-serif'
    ctx.textAlign = 'right'
    for (let i = 0; i < player.maxHealth; i++) {
      ctx.fillStyle = i < player.health ? '#ff3355' : 'rgba(255,255,255,0.2)'
      ctx.fillText('♥', heartX - i * 32, heartY)
    }
    ctx.restore()
  }

  // ==== World-space transform (camera) ====
  ctx.save()
  ctx.translate(W / 2 - world.camera.x, H / 2 - world.camera.y)

  // ==== Projectiles ====
  for (const eid of query(world, [Position, Projectile])) {
    const ax = Position.x[eid]!
    const ay = Position.y[eid]!

    ctx.save()

    // Outer electric aura
    const aura = ctx.createRadialGradient(ax, ay, 0, ax, ay, 28)
    aura.addColorStop(0, 'rgba(170, 200, 255, 0.5)')
    aura.addColorStop(0.5, 'rgba(100, 160, 255, 0.2)')
    aura.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = aura
    ctx.beginPath()
    ctx.arc(ax, ay, 28, 0, Math.PI * 2)
    ctx.fill()

    // Mini lightning tendrils (random jitter per frame = natural flicker)
    const tendrilCount = 6
    for (let i = 0; i < tendrilCount; i++) {
      const angle = (i / tendrilCount) * Math.PI * 2
      const len = 10 + Math.random() * 8
      const midX = ax + Math.cos(angle + (Math.random() - 0.5) * 0.8) * len * 0.5
      const midY = ay + Math.sin(angle + (Math.random() - 0.5) * 0.8) * len * 0.5
      const tipX = ax + Math.cos(angle) * len
      const tipY = ay + Math.sin(angle) * len
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(midX, midY)
      ctx.lineTo(tipX, tipY)
      ctx.strokeStyle = PROJECTILE_COLOR + 'bb'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Inner blue-white glow
    const core = ctx.createRadialGradient(ax, ay, 0, ax, ay, 10)
    core.addColorStop(0, '#ffffff')
    core.addColorStop(0.4, PROJECTILE_COLOR)
    core.addColorStop(1, 'rgba(100,160,255,0)')
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(ax, ay, 10, 0, Math.PI * 2)
    ctx.fill()

    // Bright white core
    ctx.beginPath()
    ctx.arc(ax, ay, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()

    ctx.restore()
  }

  // ==== Explosions (fire burst) ====
  const allExplosions = query(world, [Explosion])
  const positionedExplosions = new Set(query(world, [Explosion, Position]))
  if (allExplosions.length > 0 && (playerEid !== undefined || positionedExplosions.size > 0)) {
    const px = playerEid !== undefined ? Position.x[playerEid]! : 0
    const py = playerEid !== undefined ? Position.y[playerEid]! : 0
    for (const eid of allExplosions) {
      const ex = positionedExplosions.has(eid) ? Position.x[eid]! : px
      const ey = positionedExplosions.has(eid) ? Position.y[eid]! : py
      const radius = Explosion.radius[eid]!
      const duration = Explosion.duration[eid]!
      const remaining = Lifetime.remaining[eid]!
      const progress = 1 - remaining / duration // 0 → 1 over lifetime

      ctx.save()
      ctx.translate(ex, ey)

      const currentRadius = radius * Math.min(1, progress * 3)
      const alpha = 1 - progress

      // Inner fireball glow
      ctx.globalAlpha = alpha * 0.35
      const fireGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius)
      fireGrad.addColorStop(0, '#ffffcc')
      fireGrad.addColorStop(0.15, '#ffdd44')
      fireGrad.addColorStop(0.4, '#ff6600')
      fireGrad.addColorStop(0.7, '#cc2200')
      fireGrad.addColorStop(1, 'rgba(80, 0, 0, 0)')
      ctx.fillStyle = fireGrad
      ctx.beginPath()
      ctx.arc(0, 0, currentRadius, 0, Math.PI * 2)
      ctx.fill()

      // Flickering tongues of flame
      const tongueCount = 10
      for (let i = 0; i < tongueCount; i++) {
        const angle = (i / tongueCount) * Math.PI * 2 + progress * 2
        const flicker = 0.7 + 0.3 * Math.sin(progress * 20 + i * 3.7)
        const tongueLen = currentRadius * (0.6 + 0.4 * flicker)
        const tipX = Math.cos(angle) * tongueLen
        const tipY = Math.sin(angle) * tongueLen
        const baseSpread = currentRadius * 0.2

        ctx.globalAlpha = alpha * 0.3 * flicker
        ctx.beginPath()
        ctx.moveTo(
          Math.cos(angle + 0.3) * currentRadius * 0.3,
          Math.sin(angle + 0.3) * currentRadius * 0.3
        )
        ctx.quadraticCurveTo(
          Math.cos(angle) * (tongueLen * 0.7) + Math.sin(angle) * baseSpread,
          Math.sin(angle) * (tongueLen * 0.7) - Math.cos(angle) * baseSpread,
          tipX,
          tipY
        )
        ctx.quadraticCurveTo(
          Math.cos(angle) * (tongueLen * 0.7) - Math.sin(angle) * baseSpread,
          Math.sin(angle) * (tongueLen * 0.7) + Math.cos(angle) * baseSpread,
          Math.cos(angle - 0.3) * currentRadius * 0.3,
          Math.sin(angle - 0.3) * currentRadius * 0.3
        )
        ctx.closePath()
        const tongueGrad = ctx.createRadialGradient(0, 0, currentRadius * 0.2, 0, 0, tongueLen)
        tongueGrad.addColorStop(0, '#ffaa00')
        tongueGrad.addColorStop(0.5, '#ff4400')
        tongueGrad.addColorStop(1, 'rgba(200, 0, 0, 0)')
        ctx.fillStyle = tongueGrad
        ctx.fill()
      }

      // Hot white core
      ctx.globalAlpha = alpha * 0.4
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius * 0.25)
      coreGrad.addColorStop(0, '#ffffff')
      coreGrad.addColorStop(0.5, '#ffffaa')
      coreGrad.addColorStop(1, 'rgba(255, 200, 50, 0)')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(0, 0, currentRadius * 0.25, 0, Math.PI * 2)
      ctx.fill()

      // Outer heat shimmer ring
      ctx.globalAlpha = alpha * 0.15
      ctx.beginPath()
      ctx.arc(0, 0, currentRadius * 1.15, 0, Math.PI * 2)
      ctx.strokeStyle = '#ff440066'
      ctx.lineWidth = 8 * (1 - progress)
      ctx.stroke()

      ctx.restore()
    }
  }

  // ==== Lightning Bolts ====
  const LIGHTNING_COLOR = '#aaccff'
  const LIGHTNING_SEGMENTS = 12
  const LIGHTNING_JITTER = 35
  for (const eid of query(world, [Lightning])) {
    const tx = Lightning.targetX[eid]!
    const ty = Lightning.targetY[eid]!
    const duration = Lightning.duration[eid]!
    const remaining = Lifetime.remaining[eid]!
    const alpha = Math.min(1, remaining / (duration * 0.5))

    ctx.save()
    ctx.globalAlpha = alpha

    // Build jagged bolt path from top of viewport to target
    const viewTop = world.camera.y - H / 2
    const points: [number, number][] = [[tx, viewTop]]
    for (let i = 1; i < LIGHTNING_SEGMENTS; i++) {
      const t = i / LIGHTNING_SEGMENTS
      const x = tx + (Math.random() - 0.5) * LIGHTNING_JITTER * 2
      const y = viewTop + t * (ty - viewTop)
      points.push([x, y])
    }
    points.push([tx, ty])

    // Thick glow line
    ctx.beginPath()
    ctx.moveTo(points[0]![0], points[0]![1])
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i]![0], points[i]![1])
    }
    ctx.strokeStyle = LIGHTNING_COLOR + '44'
    ctx.lineWidth = 12
    ctx.stroke()

    // Core bright line
    ctx.beginPath()
    ctx.moveTo(points[0]![0], points[0]![1])
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i]![0], points[i]![1])
    }
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.stroke()

    // Impact glow
    const glow = ctx.createRadialGradient(tx, ty, 0, tx, ty, 40)
    glow.addColorStop(0, 'rgba(200, 220, 255, 0.9)')
    glow.addColorStop(0.4, LIGHTNING_COLOR + '66')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(tx, ty, 40, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  // ==== Lightning Beams ====
  if (playerEid !== undefined) {
    const px = Position.x[playerEid]!
    const py = Position.y[playerEid]!
    const BEAM_COLOR = '#88bbff'
    const BEAM_SEGMENTS = 16
    const BEAM_JITTER = 18

    for (const eid of query(world, [LightningBeam, Lifetime])) {
      const angle = LightningBeam.angle[eid]!
      const duration = LightningBeam.duration[eid]!
      const remaining = Lifetime.remaining[eid]!
      const alpha = remaining / duration

      // Extend to the nearest viewport edge (in world space)
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const { camera } = world
      let tMax = Infinity
      if (cos > 0) tMax = Math.min(tMax, (camera.x + W / 2 - px) / cos)
      else if (cos < 0) tMax = Math.min(tMax, (camera.x - W / 2 - px) / cos)
      if (sin > 0) tMax = Math.min(tMax, (camera.y + H / 2 - py) / sin)
      else if (sin < 0) tMax = Math.min(tMax, (camera.y - H / 2 - py) / sin)
      const endX = px + cos * tMax
      const endY = py + sin * tMax

      // Build jagged path
      const points: [number, number][] = [[px, py]]
      for (let i = 1; i < BEAM_SEGMENTS; i++) {
        const t = i / BEAM_SEGMENTS
        points.push([
          px + cos * tMax * t + (Math.random() - 0.5) * BEAM_JITTER * 2,
          py + sin * tMax * t + (Math.random() - 0.5) * BEAM_JITTER * 2,
        ])
      }
      points.push([endX, endY])

      ctx.save()
      ctx.globalAlpha = alpha

      // Wide outer glow
      ctx.beginPath()
      ctx.moveTo(points[0]![0], points[0]![1])
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]![0], points[i]![1])
      ctx.strokeStyle = BEAM_COLOR + '33'
      ctx.lineWidth = 22
      ctx.stroke()

      // Mid glow
      ctx.beginPath()
      ctx.moveTo(points[0]![0], points[0]![1])
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]![0], points[i]![1])
      ctx.strokeStyle = BEAM_COLOR + '77'
      ctx.lineWidth = 8
      ctx.stroke()

      // Core bright line
      ctx.beginPath()
      ctx.moveTo(points[0]![0], points[0]![1])
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]![0], points[i]![1])
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Origin burst
      const originGlow = ctx.createRadialGradient(px, py, 0, px, py, 50)
      originGlow.addColorStop(0, 'rgba(200, 220, 255, 0.9)')
      originGlow.addColorStop(0.4, BEAM_COLOR + '55')
      originGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = originGlow
      ctx.beginPath()
      ctx.arc(px, py, 50, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }
  }

  // ==== Clouds ====
  for (const eid of query(world, [Position, Cloud, Lifetime])) {
    const cx = Position.x[eid]!
    const cy = Position.y[eid]!
    const r = Cloud.radius[eid]!
    const t = world.time.elapsed
    const alpha = Lifetime.remaining[eid]! / Cloud.duration[eid]!

    ctx.save()
    ctx.translate(cx, cy)

    // Base ground glow
    ctx.globalAlpha = 0.18 * alpha
    const baseGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    baseGlow.addColorStop(0, 'rgba(180, 210, 255, 1)')
    baseGlow.addColorStop(1, 'rgba(100, 140, 255, 0)')
    ctx.fillStyle = baseGlow
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    // Fluffy puffs
    const puffs = [
      { x: 0, y: 0, r: r * 0.42 },
      { x: r * 0.38, y: -r * 0.08, r: r * 0.34 },
      { x: -r * 0.38, y: -r * 0.08, r: r * 0.34 },
      { x: r * 0.62, y: r * 0.12, r: r * 0.26 },
      { x: -r * 0.62, y: r * 0.12, r: r * 0.26 },
      { x: r * 0.18, y: -r * 0.28, r: r * 0.28 },
      { x: -r * 0.18, y: -r * 0.28, r: r * 0.28 },
    ]
    for (const puff of puffs) {
      const drift = Math.sin(t * 0.9 + puff.x) * 2
      ctx.globalAlpha = 0.55 * alpha
      ctx.beginPath()
      ctx.arc(puff.x + drift, puff.y, puff.r, 0, Math.PI * 2)
      const puffGrad = ctx.createRadialGradient(
        puff.x + drift,
        puff.y,
        0,
        puff.x + drift,
        puff.y,
        puff.r
      )
      puffGrad.addColorStop(0, 'rgba(230, 240, 255, 0.9)')
      puffGrad.addColorStop(0.6, 'rgba(190, 215, 255, 0.6)')
      puffGrad.addColorStop(1, 'rgba(140, 180, 255, 0)')
      ctx.fillStyle = puffGrad
      ctx.fill()
    }

    ctx.restore()
  }

  // ==== Enemies ====
  const currentBeat = metronome.beat + metronome.beatPhase
  for (const eid of query(world, [Position, Enemy])) {
    const ex = Position.x[eid]!
    const ey = Position.y[eid]!

    const cadence = BeatMovement.cadence[eid] ?? 1
    const subsSinceEnd = metronome.subBeatIndex - (BeatMovement.lastMoveEndSubBeat[eid] ?? 0)
    const cadenceProgress = cadence > 1 ? Math.min(subsSinceEnd / (cadence - 1), 1) : 1
    const fillColor = '#2266cc'
    const strokeColor = '#6688ff'
    let enemyAlpha = 1.0

    const flashProgress = currentBeat - (DamageFlash.startBeat[eid] ?? -Infinity)
    let resolvedFill = fillColor
    if (flashProgress >= 0 && flashProgress < 1) {
      const envelope = 1 - flashProgress
      const flicker = Math.abs(Math.sin(flashProgress * Math.PI))
      enemyAlpha = 1.0 - envelope * (1 - flicker) * 0.8
      // Flash toward white on damage (lerp from base blue #2266cc = 34,102,204)
      const cr = Math.round(34 + (255 - 34) * envelope)
      const cg = Math.round(102 + (255 - 102) * envelope)
      const cb = Math.round(204 + (255 - 204) * envelope)
      resolvedFill = `rgb(${cr},${cg},${cb})`
    }

    ctx.save()
    ctx.globalAlpha = enemyAlpha
    ctx.beginPath()
    ctx.arc(ex, ey, ENEMY_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = resolvedFill
    ctx.fill()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2
    ctx.stroke()

    // Intent arrow: full length always visible (ghost), fills like a progress bar toward tip
    const isMoving = metronome.subBeatIndex < (BeatMovement.moveEndSubBeat[eid] ?? 0)
    if (!isMoving) {
      const dx = BeatMovement.targetX[eid]! - ex
      const dy = BeatMovement.targetY[eid]! - ey
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 0) {
        const nx = dx / dist
        const ny = dy / dist
        const perpX = -ny
        const perpY = nx
        const arrowStart = ENEMY_RADIUS + 4
        const arrowLen = BeatMovement.distance[eid]!
        const headSize = 7
        const baseX = ex + nx * arrowStart
        const baseY = ey + ny * arrowStart
        const tipX = ex + nx * (arrowStart + arrowLen)
        const tipY = ey + ny * (arrowStart + arrowLen)
        const shaftTipX = tipX - nx * headSize
        const shaftTipY = tipY - ny * headSize

        // Ghost arrow (full extent, dim)
        ctx.save()
        ctx.globalAlpha = enemyAlpha * 0.2
        ctx.strokeStyle = '#ffffff'
        ctx.fillStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(baseX, baseY)
        ctx.lineTo(shaftTipX, shaftTipY)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(tipX, tipY)
        ctx.lineTo(shaftTipX + perpX * headSize * 0.5, shaftTipY + perpY * headSize * 0.5)
        ctx.lineTo(shaftTipX - perpX * headSize * 0.5, shaftTipY - perpY * headSize * 0.5)
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        // Filled portion growing from base toward tip
        if (cadenceProgress > 0) {
          const filledLen = arrowLen * cadenceProgress
          const fillTipX = ex + nx * (arrowStart + filledLen)
          const fillTipY = ey + ny * (arrowStart + filledLen)

          ctx.save()
          ctx.globalAlpha = enemyAlpha * 0.85
          ctx.strokeStyle = '#ffffff'
          ctx.fillStyle = '#ffffff'
          ctx.lineWidth = 2

          if (filledLen > headSize) {
            const fillShaftTipX = fillTipX - nx * headSize
            const fillShaftTipY = fillTipY - ny * headSize
            ctx.beginPath()
            ctx.moveTo(baseX, baseY)
            ctx.lineTo(fillShaftTipX, fillShaftTipY)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(fillTipX, fillTipY)
            ctx.lineTo(
              fillShaftTipX + perpX * headSize * 0.5,
              fillShaftTipY + perpY * headSize * 0.5
            )
            ctx.lineTo(
              fillShaftTipX - perpX * headSize * 0.5,
              fillShaftTipY - perpY * headSize * 0.5
            )
            ctx.closePath()
            ctx.fill()
          } else {
            ctx.beginPath()
            ctx.moveTo(baseX, baseY)
            ctx.lineTo(fillTipX, fillTipY)
            ctx.stroke()
          }

          ctx.restore()
        }
      }
    }

    // Health bar (only when damaged)
    const hp = Health.current[eid]!
    const maxHp = Health.max[eid]!
    if (hp < maxHp) {
      const barW = ENEMY_RADIUS * 2
      const barH = 4
      const barX = ex - barW / 2
      const barY = ey - ENEMY_RADIUS - 8
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(barX, barY, barW, barH)
      ctx.fillStyle = '#33cc33'
      ctx.fillRect(barX, barY, barW * (hp / maxHp), barH)
    }
    ctx.restore()
  }

  // ==== Player (drawn last, always on top) ====
  const scale = 1 + 0.1 * Math.pow(1 - world.metronome.beatPhase, 3)
  const r = PLAYER_RADIUS * scale
  if (playerEid !== undefined) {
    const angle = Player.facing[playerEid]!
    const px = Position.x[playerEid]!
    const py = Position.y[playerEid]!
    const currentBeat = metronome.beat + metronome.beatPhase
    const isInvincible = currentBeat < world.player.invincibleUntilBeat
    const playerVisible = !isInvincible || Math.floor(currentBeat * 4) % 2 === 0
    const isDashing = Dash.remaining[playerEid]! > 0
    if (playerVisible) {
      ctx.save()
      if (isDashing) ctx.globalAlpha = 0.35
      ctx.translate(px, py)
      ctx.rotate(angle)
      // Arrow shape in local space (tip pointing right along +x)
      ctx.beginPath()
      ctx.moveTo(r, 0) // tip
      ctx.lineTo(-r * 0.4, r * 0.6) // back-right wing
      ctx.lineTo(-r * 0.15, 0) // back notch
      ctx.lineTo(-r * 0.4, -r * 0.6) // back-left wing
      ctx.closePath()
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.restore()
    }
  }

  // ==== End world-space transform ====
  ctx.restore()
}
