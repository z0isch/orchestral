import './index.css'
import { addEntity, addComponent } from 'bitecs'
import { world } from './ecs/world'
import { Position, Velocity, Player, Dash } from './ecs/components'
import { timeSystem } from './ecs/systems/time'
import { createRenderSystem } from './ecs/systems/render'
import { gamepadSystem } from './ecs/systems/gamepad'
import { createGamepadHudSystem } from './ecs/systems/gamepad-hud'
import { musicScoreSystem } from './ecs/systems/music-score'
import { attackSystem } from './ecs/systems/attack'
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
import { MusicScore } from './ecs/music-score'

const startScreen = document.getElementById('start-screen')!
const playBtn = document.getElementById('play-btn')!
const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d')!

// Preload audio as a decoded buffer so we can use the AudioContext clock
const audioUrl = `${import.meta.env.BASE_URL}sounds/song-101bpm.ogg`
const audioBuffer = await fetch(audioUrl)
  .then(r => r.arrayBuffer())
  .then(buf => world.audioContext.decodeAudioData(buf))

const renderSystem = createRenderSystem(ctx)
const gamepadHudSystem = createGamepadHudSystem(ctx)
const boundsSystem = createBoundsSystem(canvas)
const enemySpawnSystem = createEnemySpawnSystem(canvas)

world.score.data = new MusicScore(
  8,
  [
    {
      beat: 0,
      subBeat: 0,
      button: 1,
      minCoolodown: 0,
      maxCooldown: 0,
      attackType: { tag: 'explosion', radius: 200 },
    },
    {
      beat: 1,
      subBeat: 0,
      button: 3,
      minCoolodown: 0,
      maxCooldown: 0,
      attackType: { tag: 'explosion', radius: 200 },
    },
    {
      beat: 2,
      subBeat: 0,
      button: 0,
      minCoolodown: 0,
      maxCooldown: 0,
      attackType: { tag: 'explosion', radius: 200 },
    },
    {
      beat: 3,
      subBeat: 0,
      button: 2,
      minCoolodown: 0,
      maxCooldown: 0,
      attackType: { tag: 'explosion', radius: 200 },
    },
    {
      beat: 4,
      subBeat: 0,
      button: 2,
      minCoolodown: 0,
      maxCooldown: 0,
      attackType: { tag: 'projectile', speed: 400, radius: 3 },
    },
    {
      beat: 5,
      subBeat: 0,
      button: 0,
      minCoolodown: 0,
      maxCooldown: 0,
      attackType: { tag: 'projectile', speed: 400, radius: 3 },
    },
    {
      beat: 6,
      subBeat: 0,
      button: 3,
      minCoolodown: 0,
      maxCooldown: 0,
      attackType: { tag: 'projectile', speed: 400, radius: 3 },
    },
    {
      beat: 7,
      subBeat: 0,
      button: 1,
      minCoolodown: 0,
      maxCooldown: 0,
      attackType: { tag: 'lightning' },
    },
  ],
  4
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

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  requestAnimationFrame(loop)
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
  beatMovementSystem(world)
  movementSystem(world)
  boundsSystem(world)
  collisionSystem(world)
  healthSystem(world)
  lifetimeSystem(world)
  enemyPlayerCollisionSystem(world)
  gameOverSystem(world)
  enemySpawnSystem(world)
  renderSystem(world)
  //gamepadHudSystem(world)
  requestAnimationFrame(loop)
}
