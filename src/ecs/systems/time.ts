import type { World } from '../world'

export const timeSystem = (world: World) => {
  const now = performance.now()
  world.time.delta = (now - world.time.then) / 1000
  world.time.elapsed += world.time.delta
  world.time.then = now
  world.metronome.sync(world.audioContext.currentTime)
}
