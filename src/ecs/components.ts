export const Position = { x: [] as number[], y: [] as number[] }
export const Velocity = { x: [] as number[], y: [] as number[] }
export type AttackType =
  | { tag: 'wand'; speed: number }
  | { tag: 'whip'; width: number; height: number; subBeatDuration: number }
export const Dash = { vx: [] as number[], vy: [] as number[], remaining: [] as number[] }
export const PLAYER_RADIUS = 20
export const Player = { facing: [] as number[] }
export const Enemy = {}
export const BeatMovement = { distance: [] as number[] }
export const Projectile = {}
export const Whip = { width: [] as number[], height: [] as number[] }
export const Lifetime = { remaining: [] as number[] }
