import './index.css'

const startScreen = document.getElementById('start-screen')!
const playBtn = document.getElementById('play-btn')!
const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d')!

const clickTrack = new Audio(`${import.meta.env.BASE_URL}sounds/clicktrack-85bpm.ogg`)

playBtn.addEventListener('click', () => {
  startScreen.style.display = 'none'
  canvas.style.display = 'block'

  clickTrack.play()

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  requestAnimationFrame(loop)
})

function update(_dt: number) {}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = '48px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Hello World', canvas.width / 2, canvas.height / 2)
}

let lastTime = 0

function loop(timestamp: number) {
  const dt = timestamp - lastTime
  lastTime = timestamp

  update(dt)
  draw()

  requestAnimationFrame(loop)
}
