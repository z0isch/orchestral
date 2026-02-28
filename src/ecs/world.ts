import { createWorld } from 'bitecs'
import { Metronome } from './metronome'

export type GamepadState = {
  connected: boolean
  id: string
  axes: number[]
  buttons: boolean[]
  prevButtons: boolean[]
  tap: { offsetMs: number | null; subBeat: number | null; history: number[] }
}

export type World = {
  time: { delta: number; elapsed: number; then: number }
  metronome: Metronome
  audioContext: AudioContext
  gamepad: GamepadState
}

export const world = createWorld<World>({
  time: { delta: 0, elapsed: 0, then: performance.now() },
  metronome: new Metronome(85),
  audioContext: new AudioContext(),
  gamepad: { connected: false, id: '', axes: [], buttons: [], prevButtons: [], tap: { offsetMs: null, subBeat: null, history: [] } },
})
