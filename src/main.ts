import './index.css'
import { addEntity, addComponent } from 'bitecs'
import { world } from './ecs/world'
import { Position, Velocity } from './ecs/components'
import { timeSystem } from './ecs/systems/time'
import { createRenderSystem } from './ecs/systems/render'
import { gamepadSystem } from './ecs/systems/gamepad'
import { createGamepadHudSystem } from './ecs/systems/gamepad-hud'
import { musicScoreSystem } from './ecs/systems/music-score'
import { createPlayerSystem } from './ecs/systems/player'
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
const playerSystem = createPlayerSystem(canvas)

world.score.data = new MusicScore(8, [
  { beat: 0, subBeat: 0, button: 0 },
  { beat: 0, subBeat: 0, button: 1 },
  { beat: 1, subBeat: 0, button: 1 },
  { beat: 1, subBeat: 2, button: 1 },
  { beat: 1, subBeat: 2, button: 3 },
  { beat: 2, subBeat: 0, button: 2 },
  { beat: 3, subBeat: 0, button: 3 },
  { beat: 4, subBeat: 0, button: 3 },
  { beat: 4, subBeat: 0, button: 0 },
  { beat: 5, subBeat: 0, button: 2 },
  { beat: 6, subBeat: 0, button: 1 },
  { beat: 7, subBeat: 0, button: 0 },
])

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
  Position.x[eid] = canvas.width / 2
  Position.y[eid] = canvas.height * 0.84
  world.player.eid = eid

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  requestAnimationFrame(loop)
})

function loop() {
  timeSystem(world)
  gamepadSystem(world)
  playerSystem(world)
  musicScoreSystem(world)
  renderSystem(world)
  //gamepadHudSystem(world)
  requestAnimationFrame(loop)
}
