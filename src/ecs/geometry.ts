export const isOnBeam = (
  px: number,
  py: number,
  angle: number,
  ex: number,
  ey: number,
  enemyRadius: number
): boolean => {
  const dx = ex - px
  const dy = ey - py
  const dot = dx * Math.cos(angle) + dy * Math.sin(angle)
  if (dot < 0) return false
  const perpSq = dx * dx + dy * dy - dot * dot
  return perpSq < enemyRadius * enemyRadius
}
