import { query } from 'bitecs'
import { Dash, Player, Velocity } from '../components'
import type { World } from '../world'

const DASH_SPEED = 1200
const DASH_DURATION = 0.12
const BEAT_WINDOW = 0.2
const RT = 7

export const dashSystem = (world: World) => {
  const eid = query(world, [Player, Dash, Velocity])[0]
  if (eid === undefined) return

  const { buttons, prevButtons } = world.gamepad

  const rtPressed = buttons[RT] && !prevButtons[RT]
  if (rtPressed) {
    const { beatPhase } = world.metronome
    const nearBeat = beatPhase < BEAT_WINDOW || beatPhase > 1 - BEAT_WINDOW

    if (nearBeat) {
      const angle = Player.facing[eid]!
      Dash.vx[eid] = Math.cos(angle) * DASH_SPEED
      Dash.vy[eid] = Math.sin(angle) * DASH_SPEED
      Dash.remaining[eid] = DASH_DURATION
    }
  }

  if (Dash.remaining[eid]! > 0) {
    Velocity.x[eid] = Dash.vx[eid]!
    Velocity.y[eid] = Dash.vy[eid]!
    Dash.remaining[eid] = Math.max(0, Dash.remaining[eid]! - world.time.delta)
  }
}
