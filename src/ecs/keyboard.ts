const GAME_KEYS = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
])

const held = new Set<string>()

window.addEventListener('keydown', e => {
  if (GAME_KEYS.has(e.code)) e.preventDefault()
  held.add(e.code)
})

window.addEventListener('keyup', e => {
  held.delete(e.code)
})

export function isKeyHeld(code: string): boolean {
  return held.has(code)
}
