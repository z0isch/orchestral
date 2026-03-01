import type { World } from '../world'
import { isKeyHeld } from '../keyboard'

const BUTTON_COUNT = 8

// Note button indices: 0=←, 1=↓, 2=↑, 3=→
// Gamepad face buttons: 0=A(bottom), 1=B(right), 2=X(left), 3=Y(top)
const GP_FACE_TO_NOTE = [1, 3, 0, 2] as const

export const gamepadSystem = (world: World) => {
  const gp = Array.from(navigator.getGamepads()).find(g => g !== null) ?? null

  world.gamepad.prevButtons = [...world.gamepad.buttons]
  while (world.gamepad.prevButtons.length < BUTTON_COUNT) world.gamepad.prevButtons.push(false)

  world.gamepad.buttons = new Array(BUTTON_COUNT).fill(false)
  world.gamepad.axes = [0, 0]

  if (gp) {
    world.gamepad.connected = true
    world.gamepad.id = gp.id
    world.gamepad.axes = Array.from(gp.axes)
    for (let i = 0; i < gp.buttons.length; i++) {
      if (!gp.buttons[i]!.pressed) continue
      const mapped = i < GP_FACE_TO_NOTE.length ? GP_FACE_TO_NOTE[i] : i
      world.gamepad.buttons[mapped] = true
    }
  } else {
    world.gamepad.connected = false
    world.gamepad.id = ''
  }

  // Keyboard: WASD → axes
  let kx = 0
  let ky = 0
  if (isKeyHeld('KeyA')) kx -= 1
  if (isKeyHeld('KeyD')) kx += 1
  if (isKeyHeld('KeyW')) ky -= 1
  if (isKeyHeld('KeyS')) ky += 1
  if (kx !== 0 && ky !== 0) {
    kx *= Math.SQRT1_2
    ky *= Math.SQRT1_2
  }
  if (kx !== 0) world.gamepad.axes[0] = kx
  if (ky !== 0) world.gamepad.axes[1] = ky

  // Keyboard: arrow keys → note buttons, space → dash
  if (isKeyHeld('ArrowLeft')) world.gamepad.buttons[0] = true
  if (isKeyHeld('ArrowDown')) world.gamepad.buttons[1] = true
  if (isKeyHeld('ArrowUp')) world.gamepad.buttons[2] = true
  if (isKeyHeld('ArrowRight')) world.gamepad.buttons[3] = true
  if (isKeyHeld('Space')) world.gamepad.buttons[7] = true

  // Detect any rising edge and record beat timing
  for (let i = 0; i < world.gamepad.buttons.length; i++) {
    if (world.gamepad.buttons[i] && !world.gamepad.prevButtons[i]) {
      const phase = world.metronome.subPhase
      const offset = phase <= 0.5 ? phase : phase - 1
      const offsetMs = offset * world.metronome.subInterval * 1000
      world.gamepad.tap.offsetMs = offsetMs
      world.gamepad.tap.subBeat = world.metronome.subBeat
      world.gamepad.tap.history.push(offsetMs)
      if (world.gamepad.tap.history.length > 8) world.gamepad.tap.history.shift()
      break
    }
  }
}
