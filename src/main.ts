import './index.css'
import { addComponent, addEntity } from 'bitecs'
import { world } from './ecs/world'
import { Position } from './ecs/components'
import { timeSystem } from './ecs/systems/time'
import { createRenderSystem } from './ecs/systems/render'

const startScreen = document.getElementById('start-screen')!
const playBtn = document.getElementById('play-btn')!
const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d')!

// Preload audio as a decoded buffer so we can use the AudioContext clock
const audioUrl = `${import.meta.env.BASE_URL}sounds/clicktrack-85bpm.ogg`
const audioBuffer = await fetch(audioUrl)
  .then(r => r.arrayBuffer())
  .then(buf => world.audioContext.decodeAudioData(buf))

const renderSystem = createRenderSystem(ctx)

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

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  // Seed some demo entities
  for (let i = 0; i < 20; i++) {
    const eid = addEntity(world)
    addComponent(world, eid, Position)
    Position.x[eid] = Math.random() * canvas.width
    Position.y[eid] = Math.random() * canvas.height
  }

  requestAnimationFrame(loop)
})

function loop() {
  timeSystem(world)
  renderSystem(world)
  requestAnimationFrame(loop)
}
