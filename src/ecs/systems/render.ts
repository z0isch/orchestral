import { query } from 'bitecs'
import {
  Position,
  Projectile,
  Enemy,
  Player,
  Dash,
  Whip,
  Lifetime,
  PLAYER_RADIUS,
} from '../components'
import { ENEMY_RADIUS } from './enemy-player-collision'
import { GRACE_S } from './music-score'
import type { World } from '../world'

const WAND_COLOR = '#33cc33'
const WHIP_COLOR = '#cc33cc'
const BUTTON_COLORS = ['#33cc33', '#dd3333', '#dddd00', '#3366dd']
const BUTTON_LABELS = ['←', '↓', '↑', '→']
const LOOK_AHEAD_BEATS = 4
const HIGHWAY_H = 300
const HIGHWAY_W = 200

export const createRenderSystem = (ctx: CanvasRenderingContext2D) => (world: World) => {
  const { score, metronome, gamepad } = world
  const W = ctx.canvas.width
  const H = ctx.canvas.height
  const playerEid = query(world, [Player, Position])[0]

  ctx.clearRect(0, 0, W, H)

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
    const uniqueButtons = [...new Set(score.data.notes.map(n => n.button))].sort((a, b) => a - b)

    if (uniqueButtons.length > 0) {
      const laneCount = uniqueButtons.length
      const playerX = playerEid !== undefined ? Position.x[playerEid]! : W / 2
      const playerY = playerEid !== undefined ? Position.y[playerEid]! : H * 0.84
      const hitLineY = playerY - PLAYER_RADIUS + 100
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
      ctx.globalAlpha = 0.3

      const bgGrad = ctx.createLinearGradient(0, highwayTop, 0, hitLineY)
      bgGrad.addColorStop(0, '#060610')
      bgGrad.addColorStop(1, '#0e0e1c')
      ctx.beginPath()
      ctx.moveTo(perspX(0, highwayTop), highwayTop)
      ctx.lineTo(perspX(1, highwayTop), highwayTop)
      ctx.lineTo(brX, hitLineY)
      ctx.lineTo(blX, hitLineY)
      ctx.closePath()
      ctx.fillStyle = bgGrad
      ctx.fill()
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
        while (baseAbsPos < currentPos - GRACE_S / metronome.interval) baseAbsPos += loopBeats

        for (let pass = 0; pass <= futurePasses; pass++) {
          const timeUntil = baseAbsPos + pass * loopBeats - currentPos
          if (timeUntil > LOOK_AHEAD_BEATS) break

          const laneIdx = uniqueButtons.indexOf(note.button)
          if (laneIdx < 0) continue

          const noteY = hitLineY - (timeUntil / LOOK_AHEAD_BEATS) * HIGHWAY_H
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

          ctx.save()
          ctx.globalAlpha = onCooldown ? 0.05 : 0.3

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
    const playerX = Position.x[playerEid]!
    const playerY = Position.y[playerEid]! - PLAYER_RADIUS + 100
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

  // ==== Projectiles ====
  for (const eid of query(world, [Position, Projectile])) {
    const ax = Position.x[eid]!
    const ay = Position.y[eid]!
    ctx.save()
    ctx.globalAlpha = 1
    const glow = ctx.createRadialGradient(ax, ay, 0, ax, ay, 20)
    glow.addColorStop(0, WAND_COLOR + 'cc')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(ax, ay, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(ax, ay, 6, 0, Math.PI * 2)
    ctx.fillStyle = WAND_COLOR
    ctx.fill()
    ctx.restore()
  }

  // ==== Whips (follow player position) ====
  if (playerEid !== undefined && query(world, [Whip]).length > 0) {
    const wx = Position.x[playerEid]!
    const wy = Position.y[playerEid]! - PLAYER_RADIUS * 2
    for (const eid of query(world, [Whip])) {
      const ww = Whip.width[eid]!
      const wh = Whip.height[eid]!
      const duration = Whip.duration[eid]!
      const remaining = Lifetime.remaining[eid]!
      const progress = 1 - remaining / duration // 0 → 1 over lifetime

      ctx.save()
      ctx.translate(wx, wy)

      // Subtle hitbox fill
      ctx.globalAlpha = 0.08
      ctx.fillStyle = WHIP_COLOR
      ctx.fillRect(-ww / 2, -wh / 2, ww, wh)

      // Animated whip trail around the rectangle perimeter
      const perim = 2 * (ww + wh)
      const TRAIL_POINTS = 40
      const TRAIL_LENGTH = 0.6 // fraction of perimeter covered by trail
      const WAVE_AMP = 12
      const WAVE_FREQ = 6
      const headT = progress * 2 // whip head sweeps twice around during lifetime

      // Map t (0..1 along perimeter) to (x, y) on the rectangle, plus a normal direction
      const perimPoint = (t: number): [number, number, number, number] => {
        t = ((t % 1) + 1) % 1
        const d = t * perim
        const hw = ww / 2
        const hh = wh / 2
        if (d < ww) {
          // Top edge: left to right
          return [-hw + d, -hh, 0, -1]
        } else if (d < ww + wh) {
          // Right edge: top to bottom
          return [hw, -hh + (d - ww), 1, 0]
        } else if (d < 2 * ww + wh) {
          // Bottom edge: right to left
          return [hw - (d - ww - wh), hh, 0, 1]
        } else {
          // Left edge: bottom to top
          return [-hw, hh - (d - 2 * ww - wh), -1, 0]
        }
      }

      ctx.globalAlpha = 1
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 0; i < TRAIL_POINTS - 1; i++) {
        const frac = i / (TRAIL_POINTS - 1) // 0 = head, 1 = tail
        const t1 = headT - frac * TRAIL_LENGTH
        const t2 = headT - (frac + 1 / (TRAIL_POINTS - 1)) * TRAIL_LENGTH
        const wave1 =
          Math.sin(((t1 * perim) / ww) * WAVE_FREQ + progress * Math.PI * 8) * WAVE_AMP * (1 - frac)
        const wave2 =
          Math.sin(((t2 * perim) / ww) * WAVE_FREQ + progress * Math.PI * 8) *
          WAVE_AMP *
          (1 - (frac + 1 / (TRAIL_POINTS - 1)))

        const [x1, y1, nx1, ny1] = perimPoint(t1)
        const [x2, y2, nx2, ny2] = perimPoint(t2)

        const alpha = (1 - frac) * 0.9
        const width = (1 - frac) * 5 + 1

        ctx.beginPath()
        ctx.moveTo(x1 + nx1 * wave1, y1 + ny1 * wave1)
        ctx.lineTo(x2 + nx2 * wave2, y2 + ny2 * wave2)
        ctx.strokeStyle = `rgba(204, 51, 204, ${alpha})`
        ctx.lineWidth = width
        ctx.stroke()
      }

      // Bright glow at whip head
      const [hx, hy, hnx, hny] = perimPoint(headT)
      const headWave = Math.sin(progress * Math.PI * 8) * WAVE_AMP
      const glowX = hx + hnx * headWave
      const glowY = hy + hny * headWave
      const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 18)
      glow.addColorStop(0, 'rgba(255, 150, 255, 0.9)')
      glow.addColorStop(0.4, 'rgba(204, 51, 204, 0.5)')
      glow.addColorStop(1, 'rgba(204, 51, 204, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(glowX, glowY, 18, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }
  }

  // ==== Enemies ====
  for (const eid of query(world, [Position, Enemy])) {
    const ex = Position.x[eid]!
    const ey = Position.y[eid]!
    ctx.beginPath()
    ctx.arc(ex, ey, ENEMY_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = '#cc2222'
    ctx.fill()
    ctx.strokeStyle = '#ff6666'
    ctx.lineWidth = 2
    ctx.stroke()
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
}
