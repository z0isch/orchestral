import type { World } from '../world'

export const gamepadSystem = (world: World) => {
  const gp = Array.from(navigator.getGamepads()).find(g => g !== null) ?? null

  world.gamepad.prevButtons = [...world.gamepad.buttons]

  if (gp) {
    world.gamepad.connected = true
    world.gamepad.id = gp.id
    world.gamepad.axes = Array.from(gp.axes)
    world.gamepad.buttons = gp.buttons.map(b => b.pressed)

    // Detect any rising edge (not-pressed → pressed) and record beat timing
    for (let i = 0; i < world.gamepad.buttons.length; i++) {
      if (world.gamepad.buttons[i] && !world.gamepad.prevButtons[i]) {
        const phase = world.metronome.subPhase
        // Signed offset: negative = early, positive = late
        const offset = phase <= 0.5 ? phase : phase - 1
        const offsetMs = offset * world.metronome.subInterval * 1000
        world.gamepad.tap.offsetMs = offsetMs
        world.gamepad.tap.subBeat = world.metronome.subBeat
        world.gamepad.tap.history.push(offsetMs)
        if (world.gamepad.tap.history.length > 8) world.gamepad.tap.history.shift()
        break
      }
    }
  } else {
    world.gamepad.connected = false
    world.gamepad.id = ''
    world.gamepad.axes = []
    world.gamepad.buttons = []
  }
}
