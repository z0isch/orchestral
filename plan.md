# Player Entity & Highway Repositioning

## Context
The game currently has a note highway fixed to the center of the screen. We need a player character (white circle) that moves with the left stick, and the highway should follow the player — always sitting above their head.

## Changes

### 1. Add player state to World (`src/ecs/world.ts`)
- Add `player: { eid: number }` to the `World` type and initial state
- This lets other systems (like the highway) find the player entity

### 2. Create player movement system (`src/ecs/systems/player.ts`)
- New system that reads `world.gamepad.axes[0]` (left stick X) and `axes[1]` (left stick Y)
- Apply a deadzone (~0.15) to ignore stick drift
- Set `Velocity.x[eid]` and `Velocity.y[eid]` based on stick input scaled by a speed constant
- Update `Position.x[eid]` and `Position.y[eid]` using velocity * delta time
- Clamp position to canvas bounds

### 3. Spawn player entity in main loop (`src/main.ts`)
- Import `addEntity` from bitecs and `Position`, `Velocity` components
- Create entity after world init, store eid in `world.player.eid`
- Set initial position to center-bottom of screen (where hitLine currently is)
- Add to game loop before render: `playerSystem(world)`

### 4. Render system already handles the player
- The existing render system in `src/ecs/systems/render.ts` queries all entities with `Position` and draws white circles — the player will appear automatically

### 5. Reposition highway relative to player (`src/ecs/systems/music-score-highway.ts`)
- Read player position from `Position.x[world.player.eid]` / `Position.y[world.player.eid]`
- Set `hitLineY` to `playerY - playerRadius` (just above the player's head) instead of `H * 0.84`
- Set `cx` to `playerX` instead of `W / 2`
- Scale the highway: reduce `highwayW` and `highwayH` proportionally so it fits between the top of the screen and the player
- The highway top stays at `H * 0.04`, so `highwayH = hitLineY - highwayTop`
- Scale `highwayW` proportionally to the ratio of new highwayH vs original

## Files to modify
- `src/ecs/world.ts` — add player field
- `src/ecs/components.ts` — no changes needed (Position/Velocity exist)
- `src/ecs/systems/player.ts` — new file
- `src/main.ts` — spawn entity, add system to loop
- `src/ecs/systems/music-score-highway.ts` — reposition relative to player
- `src/ecs/systems/render.ts` — no changes needed

## Verification
- Run `npx vite dev`, open in browser, press Play
- Move left stick — white circle should move around screen
- Note highway should follow the player, centered above their head
- Highway should scale smaller when player is higher on screen
