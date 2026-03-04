import './index.css'
import { addEntity, addComponent } from 'bitecs'
import { AUDIO_URL, world } from './ecs/world'
import {
  mountScoreEditor,
  showScoreEditor,
  hideScoreEditor,
} from './score-editor/mount'
import { Position, Velocity, Player, Dash } from './ecs/components'
import { timeSystem } from './ecs/systems/time'
import { createRenderSystem } from './ecs/systems/render'
import { gamepadSystem } from './ecs/systems/gamepad'
import { createGamepadHudSystem } from './ecs/systems/gamepad-hud'
import { musicScoreSystem } from './ecs/systems/music-score'
import { attackSystem } from './ecs/systems/attack'
import { lightningBeamSystem } from './ecs/systems/lightning-beam'
import { collisionSystem } from './ecs/systems/collision'
import { createEnemySpawnSystem } from './ecs/systems/enemy-spawn'
import { movementSystem } from './ecs/systems/movement'
import { beatMovementSystem } from './ecs/systems/beat-movement'
import { inputSystem } from './ecs/systems/input'
import { dashSystem } from './ecs/systems/dash'
import { createBoundsSystem } from './ecs/systems/bounds'
import { enemyPlayerCollisionSystem } from './ecs/systems/enemy-player-collision'
import { gameOverSystem } from './ecs/systems/game-over'
import { healthSystem } from './ecs/systems/health'
import { lifetimeSystem } from './ecs/systems/lifetime'
import { cloudSystem } from './ecs/systems/cloud'
import { MusicScore, ScoreNote } from './ecs/music-score'

const startScreen = document.getElementById('start-screen')!
const playBtn = document.getElementById('play-btn')!
const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d')!

// Preload audio as a decoded buffer so we can use the AudioContext clock
const audioBuffer = await fetch(AUDIO_URL)
  .then(r => r.arrayBuffer())
  .then(buf => world.audioContext.decodeAudioData(buf))

const renderSystem = createRenderSystem(ctx)
const gamepadHudSystem = createGamepadHudSystem(ctx)
const boundsSystem = createBoundsSystem(canvas)
const enemySpawnSystem = createEnemySpawnSystem(canvas)

const allAttacks = (beat: number, subBeat: number): ScoreNote[] => [
  {
    beat,
    subBeat,
    button: 0,
    minCoolodown: 24,
    maxCooldown: 24,
    attackType: { tag: 'lightning', damage: 20 },
  },
  {
    beat,
    subBeat,
    button: 1,
    minCoolodown: 24,
    maxCooldown: 24,
    attackType: { tag: 'projectile', speed: 400, radius: 3, damage: 10 },
  },
  {
    beat,
    subBeat,
    button: 2,
    minCoolodown: 24,
    maxCooldown: 24,
    attackType: { tag: 'cloud', radius: 120, subBeatDuration: 12, damage: 20 },
  },
  {
    beat,
    subBeat,
    button: 3,
    minCoolodown: 24,
    maxCooldown: 24,
    attackType: { tag: 'explosion', radius: 200, damage: 10 },
  },
]

// { tag: 'lightning', damage: 7 }
// { tag: 'projectile', speed: 400, radius: 3, damage: 7 }
// { tag: 'cloud', radius: 120, subBeatDuration: 10, damage: 1 }
// { tag: 'explosion', radius: 200, damage: 7 }

world.score.data = new MusicScore(4, [], 4)

let rafId = 0
let editorOpen = false

function openEditor() {
  editorOpen = true
  cancelAnimationFrame(rafId)
  world.audioContext.suspend()
  showScoreEditor(world.score.data.notes)
}

function closeEditor() {
  editorOpen = false
  hideScoreEditor()
  world.audioContext.resume()
  world.time.then = performance.now()
  rafId = requestAnimationFrame(loop)
}

mountScoreEditor(
  (notes) => {
    world.score.data = new MusicScore(4, notes, 4)
    closeEditor()
  },
  () => closeEditor()
)

playBtn.addEventListener('click', () => {
  startScreen.style.display = 'none'
  canvas.style.display = 'block'

  // Browsers suspend AudioContext until a user gesture — resume it, then
  // start playback and anchor the metronome to the exact same timestamp.
  world.audioContext.resume().then(() => {
    const source = world.audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(world.audioContext.destination)
    source.start()
    // Anchor metronome to the audio clock at the moment playback begins
    world.metronome.start(world.audioContext.currentTime)
  })

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Spawn player entity at center-bottom
  const eid = addEntity(world)
  addComponent(world, eid, Position)
  addComponent(world, eid, Velocity)
  addComponent(world, eid, Player)
  addComponent(world, eid, Dash)
  Position.x[eid] = canvas.width / 2
  Position.y[eid] = canvas.height / 2
  Player.facing[eid] = -Math.PI / 2

  rafId = requestAnimationFrame(loop)
})

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

window.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault()
    if (editorOpen) {
      closeEditor()
    } else {
      openEditor()
    }
  }
})

function loop() {
  timeSystem(world)

  if (world.gameOver) {
    renderSystem(world)
    return
  }

  gamepadSystem(world)
  inputSystem(world)
  dashSystem(world)
  musicScoreSystem(world)
  attackSystem(world)
  lightningBeamSystem(world)
  beatMovementSystem(world)
  movementSystem(world)
  boundsSystem(world)
  cloudSystem(world)
  collisionSystem(world)
  healthSystem(world)
  lifetimeSystem(world)
  enemyPlayerCollisionSystem(world)
  gameOverSystem(world)
  enemySpawnSystem(world)
  renderSystem(world)
  //gamepadHudSystem(world)
  rafId = requestAnimationFrame(loop)
}
