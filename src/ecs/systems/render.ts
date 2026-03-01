import { query } from 'bitecs'
import { Position } from '../components'
import { PLAYER_RADIUS } from './player'
import type { World } from '../world'

const BUTTON_COLORS = ['#33cc33', '#dd3333', '#dddd00', '#3366dd', '#dd6633']
const BUTTON_LABELS = ['↓', '→', '←', '↑', '']
const LOOK_AHEAD_BEATS = 4
const HIGHWAY_H = 300
const HIGHWAY_W = 200

export const createRenderSystem = (ctx: CanvasRenderingContext2D) => (world: World) => {
  const { score, metronome, gamepad } = world
  const W = ctx.canvas.width
  const H = ctx.canvas.height

  ctx.clearRect(0, 0, W, H)

  // ==== Highway ====
  if (metronome.beat >= 0) {
    const uniqueButtons = [...new Set(score.data.notes.map(n => n.button))].sort((a, b) => a - b)

    if (uniqueButtons.length > 0) {
      const laneCount = uniqueButtons.length
      const playerX = Position.x[world.player.eid] ?? W / 2
      const playerY = Position.y[world.player.eid] ?? H * 0.84
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
      const { loopBeats, notes } = score.data
      const futurePasses = Math.ceil(LOOK_AHEAD_BEATS / loopBeats) + 1
      for (const note of notes) {
        const notePosInLoop = note.beat + note.subBeat / metronome.subdivisions
        let baseAbsPos = Math.floor(currentPos / loopBeats) * loopBeats + notePosInLoop
        while (baseAbsPos < currentPos - 0.05) baseAbsPos += loopBeats

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
          const onCooldown = beatsRemainingOnCooldown > 0 && beatsRemainingOnCooldown >= timeUntil

          ctx.save()
          ctx.globalAlpha = onCooldown ? 0.02 : 0.3

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

  // ==== Player (drawn last, always on top) ====
  const scale = 1 + 0.1 * Math.pow(1 - world.metronome.beatPhase, 3)
  const r = 12 * scale
  const angle = world.player.facing
  for (const eid of query(world, [Position])) {
    const px = Position.x[eid]!
    const py = Position.y[eid]!
    ctx.save()
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
