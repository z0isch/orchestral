import { createWorld } from 'bitecs'
import { Metronome } from './metronome'

export type World = {
  time: { delta: number; elapsed: number; then: number }
  metronome: Metronome
  audioContext: AudioContext
}

export const world = createWorld<World>({
  time: { delta: 0, elapsed: 0, then: performance.now() },
  metronome: new Metronome(85),
  audioContext: new AudioContext(),
})
