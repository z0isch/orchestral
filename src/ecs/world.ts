import { createWorld } from 'bitecs'
import { Metronome } from './metronome'
import { MusicScore, type ScoreNote } from './music-score'

export type AttackRequest = { button: number; damage: number; x: number; y: number; angle: number }

export type GamepadState = {
  connected: boolean
  id: string
  axes: number[]
  buttons: boolean[]
  prevButtons: boolean[]
  tap: { offsetMs: number | null; subBeat: number | null; history: number[] }
}

export type GameOver = { reason: 'survived' | 'died'; points: number; combo: number }

export type World = {
  time: { delta: number; elapsed: number; then: number }
  metronome: Metronome
  audioContext: AudioContext
  gamepad: GamepadState
  attacks: { pending: AttackRequest[] }
  score: {
    data: MusicScore
    active: ScoreNote[]
    result: { hit: boolean; timestamp: number } | null
    pending: { notes: ScoreNote[]; deadline: number } | null
    hits: number
    noteCooldowns: Map<ScoreNote, { beat: number; cooldown: number }>
    points: number
    combo: number
  }
  player: {
    health: number
    maxHealth: number
    invincibleUntilBeat: number
  }
  gameOver: GameOver | null
}

export const world = createWorld<World>({
  time: { delta: 0, elapsed: 0, then: performance.now() },
  metronome: new Metronome(101),
  audioContext: new AudioContext(),
  gamepad: {
    connected: false,
    id: '',
    axes: [],
    buttons: [],
    prevButtons: [],
    tap: { offsetMs: null, subBeat: null, history: [] },
  },
  attacks: { pending: [] },
  score: {
    data: new MusicScore(4, []),
    active: [],
    result: null,
    pending: null,
    hits: 0,
    noteCooldowns: new Map(),
    points: 0,
    combo: 0,
  },
  player: { health: 3, maxHealth: 3, invincibleUntilBeat: -1 },
  gameOver: null,
})
