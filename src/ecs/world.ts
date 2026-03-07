import { createWorld } from 'bitecs'
import { Metronome } from './metronome'
import { MusicScore, type ScoreNote } from './music-score'

import type { AttackType } from './components'
import { DEFAULT_NOTE_INVENTORY, type InventoryNote } from './note-inventory'

export const BPM = 101
export const AUDIO_URL = `${import.meta.env.BASE_URL}sounds/song-101bpm.ogg`

export type AttackRequest = {
  type: AttackType
  x: number
  y: number
  angle: number
  targetX?: number
  targetY?: number
}

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
  camera: { x: number; y: number }
  metronome: Metronome
  audioContext: AudioContext
  gamepad: GamepadState
  attacks: { pending: AttackRequest[] }
  score: {
    data: MusicScore
    active: ScoreNote[]
    result: { hit: boolean; timestamp: number } | null
    pending: {
      notes: ScoreNote[]
      deadline: number
      hitNotes: ScoreNote[]
      autoNotes: ScoreNote[]
      openedForSubBeatIndex: number
    } | null
    hits: number
    noteCooldowns: Map<ScoreNote, { beat: number; cooldown: number }>
    sustainedHolds: Set<ScoreNote>
    autoSustainedHolds: Set<ScoreNote>
    points: number
    combo: number
    graceS: number
  }
  player: {
    health: number
    maxHealth: number
    invincibleUntilBeat: number
  }
  noteInventory: InventoryNote[]
  gameOver: GameOver | null
}

export const world = createWorld<World>({
  time: { delta: 0, elapsed: 0, then: performance.now() },
  camera: { x: 0, y: 0 },
  metronome: new Metronome(BPM),
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
    sustainedHolds: new Set<ScoreNote>(),
    autoSustainedHolds: new Set<ScoreNote>(),
    points: 0,
    combo: 0,
    graceS: 0.1,
  },
  noteInventory: DEFAULT_NOTE_INVENTORY.map(n => ({ ...n })),
  player: { health: 10, maxHealth: 10, invincibleUntilBeat: -1 },
  gameOver: null,
})
