import type { World } from '../world'

const GAME_DURATION_S = 4.5 * 60

export const gameOverSystem = (world: World) => {
  if (world.gameOver) return

  if (world.player.health <= 0) {
    world.gameOver = { reason: 'died', points: world.score.points, combo: world.score.combo }
    world.audioContext.suspend()
  } else if (world.time.elapsed >= GAME_DURATION_S) {
    world.gameOver = { reason: 'survived', points: world.score.points, combo: world.score.combo }
    world.audioContext.suspend()
  }
}
