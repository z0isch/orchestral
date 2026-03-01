import type { World } from '../world'

const PAD = 16
const LINE = 18

export const createGamepadHudSystem = (ctx: CanvasRenderingContext2D) => (world: World) => {
  const { gamepad } = world
  ctx.save()
  ctx.font = '13px monospace'

  if (!gamepad.connected) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText('No gamepad connected — press a button to activate', PAD, ctx.canvas.height - PAD)
    ctx.restore()
    return
  }

  // Background panel
  const cols = Math.ceil(gamepad.buttons.length / 8)
  const tapRows = 3 // beat phase + tap offset + history
  const panelH = PAD + LINE * (2 + gamepad.axes.length + cols + tapRows) + PAD
  const panelW = 320
  const panelY = ctx.canvas.height - panelH - PAD
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.beginPath()
  ctx.roundRect(PAD, panelY, panelW, panelH, 8)
  ctx.fill()

  let y = panelY + PAD + LINE

  // Controller name (truncated)
  ctx.fillStyle = '#aaa'
  ctx.fillText(gamepad.id.slice(0, 36), PAD + 8, y)
  y += LINE

  // Axes
  for (let i = 0; i < gamepad.axes.length; i++) {
    const val = gamepad.axes[i]!
    const label = `axis ${i}:`
    ctx.fillStyle = '#ccc'
    ctx.fillText(label, PAD + 8, y)

    // Bar
    const barX = PAD + 70
    const barW = 160
    const barH = 10
    const barY = y - barH + 2
    ctx.fillStyle = '#333'
    ctx.fillRect(barX, barY, barW, barH)
    // Filled portion from center
    const filled = (val / 2) * barW
    ctx.fillStyle = Math.abs(val) > 0.1 ? '#4af' : '#555'
    ctx.fillRect(barX + barW / 2, barY, filled, barH)
    // Center tick
    ctx.fillStyle = '#888'
    ctx.fillRect(barX + barW / 2 - 1, barY - 1, 2, barH + 2)

    ctx.fillStyle = '#ccc'
    ctx.fillText(val.toFixed(2), barX + barW + 8, y)
    y += LINE
  }

  // Buttons (dots in a grid)
  y += 4
  const DOT = 14
  const SPACING = 18
  const expectedButtons = new Set(world.score.active.map(n => n.button))
  for (let i = 0; i < gamepad.buttons.length; i++) {
    const col = i % 8
    const row = Math.floor(i / 8)
    const bx = PAD + 8 + col * SPACING
    const by = y + row * (DOT + 4) - DOT / 2
    const pressed = gamepad.buttons[i]
    const expected = expectedButtons.has(i)
    ctx.beginPath()
    ctx.arc(bx + DOT / 2, by + DOT / 2, DOT / 2, 0, Math.PI * 2)
    ctx.fillStyle = pressed && expected ? '#4f4' : expected ? '#fa0' : pressed ? '#4af' : '#444'
    ctx.fill()
    ctx.fillStyle = '#888'
    ctx.font = '9px monospace'
    ctx.fillText(String(i), bx + (i < 10 ? 3 : 1), by + DOT / 2 + 3)
    ctx.font = '13px monospace'
  }

  // Beat timing section
  y += LINE

  // Beat phase bar
  ctx.fillStyle = '#ccc'
  ctx.fillText('beat:', PAD + 8, y)
  const bpBarX = PAD + 70
  const bpBarW = 160
  const bpBarH = 10
  const bpBarY = y - bpBarH + 2
  ctx.fillStyle = '#333'
  ctx.fillRect(bpBarX, bpBarY, bpBarW, bpBarH)
  ctx.fillStyle = '#8f4'
  ctx.fillRect(bpBarX, bpBarY, world.metronome.beatPhase * bpBarW, bpBarH)
  ctx.fillStyle = '#ccc'
  ctx.fillText(world.metronome.beatPhase.toFixed(2), bpBarX + bpBarW + 8, y)
  y += LINE

  // Last tap offset
  const { tap } = gamepad
  if (tap.offsetMs !== null) {
    const ms = tap.offsetMs
    const absMs = Math.abs(ms)
    // Green < 30ms, yellow < 80ms, red otherwise
    const color = absMs < 30 ? '#4f4' : absMs < 80 ? '#fa0' : '#f44'
    const sign = ms >= 0 ? '+' : ''
    ctx.fillStyle = '#ccc'
    ctx.fillText('tap: ', PAD + 8, y)
    ctx.fillStyle = color
    ctx.fillText(`${sign}${ms.toFixed(0)}ms`, PAD + 50, y)
    ctx.fillStyle = '#888'
    const sub = tap.subBeat !== null ? ` sub ${tap.subBeat + 1}/${world.metronome.subdivisions}` : ''
    ctx.fillText((ms >= 0 ? 'late' : 'early') + sub, PAD + 120, y)
    y += LINE

    // History: small dots, colored by accuracy, newest on right
    const dotR = 5
    const dotSpacing = 14
    for (let i = 0; i < tap.history.length; i++) {
      const hMs = tap.history[i]!
      const hAbs = Math.abs(hMs)
      const hColor = hAbs < 30 ? '#4f4' : hAbs < 80 ? '#fa0' : '#f44'
      const dx = PAD + 8 + i * dotSpacing + dotR
      ctx.beginPath()
      ctx.arc(dx, y - dotR, dotR, 0, Math.PI * 2)
      ctx.fillStyle = hColor
      ctx.fill()
    }
  } else {
    ctx.fillStyle = '#555'
    ctx.fillText('tap a button on the beat', PAD + 8, y)
  }

  ctx.restore()
}
