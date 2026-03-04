# MusicScore Editor UI

## Context

The game's `MusicScore` is currently hardcoded in `main.ts`. We need an in-game UI so the player can visually compose their attack pattern on a musical staff. The player collects notes through leveling up (finite inventory) and drags them onto the staff to build their score. The UI overlays the canvas and pauses the game while open.

## Approach: React Overlay

Install React and render it into a dedicated `<div>` layered over the `<canvas>`. The game loop and React are fully independent — they communicate through the shared `world` object and callbacks.

### React Setup Required
- Install: `react`, `react-dom`, `@types/react`, `@types/react-dom`
- Install: `@vitejs/plugin-react`
- Configure: add `jsx: "react-jsx"` to `tsconfig.app.json`
- Configure: add `react()` plugin to `vite.config.ts`

---

## Data Model

```typescript
// src/score-editor/types.ts
type EditorAttackTag = 'lightning' | 'projectile' | 'cloud' | 'explosion'
type NoteDuration = 1 | 2 | 4  // quarter, half, whole

type PlacedNote = {
  id: string  // unique ID for React keys
  attackTag: EditorAttackTag
  duration: NoteDuration
  startSlot: number  // 0-15 (4 measures x 4 slots)
  line: number       // 0-3 (one per attack type)
}

type InventoryNote = {
  attackTag: EditorAttackTag
  duration: NoteDuration
  count: number  // finite — player collects notes via leveling
}
```

**Line-to-attack mapping** (matches existing button indices):
- Line 0 → lightning (button 0, color #33cc33)
- Line 1 → projectile (button 1, color #dd3333)
- Line 2 → cloud (button 2, color #dddd00)
- Line 3 → explosion (button 3, color #3366dd)

## UI Layout

```
+----------------------------------------------------------+
|  Score Editor                              [Apply][Cancel] |
|                                                            |
|  Staff: 4 lines x 16 columns (4 measures of 4 slots)      |
|  ─────────────────────────────────────────────────────     |
|  ⚡ lightning  [==][  ][  ][  ]│[    ][  ][  ]│[  ]...     |
|  🔴 projectile [  ][======][  ]│[  ][  ][  ][  ]│...       |
|  ☁ cloud      [  ][  ][========]│[  ][  ][  ][  ]│...      |
|  💥 explosion  [  ][  ][  ][==]│[  ][  ][  ][  ]│...       |
|  ─────────────────────────────────────────────────────     |
|                                                            |
|  Inventory (drag notes onto staff, click placed to remove) |
|  [♩ lightning x3] [♩ projectile x2] [♩ cloud x1] ...      |
|  [𝅗𝅥 lightning x1] [𝅗𝅥 projectile x2] ...                  |
|  [𝅝 cloud x1] ...                                          |
+----------------------------------------------------------+
```

## Component Tree

```
<ScoreEditorOverlay>          — fixed overlay, dark backdrop
  <Header />                  — title + Apply/Cancel buttons
  <Staff>                     — CSS Grid: 4 rows x 16 cols
    <StaffLine />  x4         — label + 16 cells per line
      <StaffCell />  x16     — drop target, renders PlacedNote if occupied
  <Inventory>                 — draggable note chips
    <InventoryChip />  xN    — one per (attackTag, duration) with count
  <DragGhost />               — follows pointer during drag (portal to body)
```

## State Management

Single `useReducer` in `<ScoreEditorOverlay>`:

```typescript
type EditorAction =
  | { tag: 'place'; note: PlacedNote }
  | { tag: 'remove'; noteId: string }
  | { tag: 'load'; placedNotes: PlacedNote[]; inventory: InventoryNote[] }
```

Drag state tracked via `useRef` (no re-renders during drag movement — only on drop).

## Drag-and-Drop (Pointer Events)

1. `onPointerDown` on `<InventoryChip>` → store drag info in ref, show `<DragGhost>`
2. `onPointerMove` on overlay → update ghost position via ref (no state update)
3. `onPointerUp` → hit-test `StaffCell` via `data-line` / `data-slot` attributes on `elementFromPoint`
   - Validate: fits within 16 slots, no overlap, inventory count > 0
   - If valid: dispatch `place` action
   - Click on placed note: dispatch `remove` action (returns to inventory)

## Note Duration → ScoreNote Mapping

- **Quarter (1)**: 1 slot → 1 `ScoreNote` at that (beat, subBeat)
- **Half (2)**: 2 slots → 1 `ScoreNote` at start position, second slot blocked
- **Whole (4)**: 4 slots → 1 `ScoreNote` at start position, remaining slots blocked

Each placed note produces exactly one `ScoreNote`. Duration is an editor/layout concept only.

## Conversion Functions

```typescript
// src/score-editor/conversion.ts
slotToBeatSubBeat(slot) → { beat: Math.floor(slot/4), subBeat: slot % 4 }
editorStateToScoreNotes(placedNotes) → ScoreNote[]
scoreNotesToPlacedNotes(notes: ScoreNote[]) → PlacedNote[]  // defaults to duration=1
```

Default attack params (from current `main.ts`):
- lightning: `{ tag: 'lightning', damage: 20 }`
- projectile: `{ tag: 'projectile', speed: 400, radius: 3, damage: 10 }`
- cloud: `{ tag: 'cloud', radius: 120, subBeatDuration: 12, damage: 20 }`
- explosion: `{ tag: 'explosion', radius: 200, damage: 10 }`

## Game Integration

**Toggle**: `Tab` key (with `e.preventDefault()` to avoid browser tab-focus).

**Pause/Resume** in `main.ts`:
- Open: `world.audioContext.suspend()`, stop `requestAnimationFrame`
- Close: `world.audioContext.resume()`, reset `world.time.then`, restart loop
- Apply: `world.score.data = new MusicScore(4, notes, 4)`

**React mount**: one-time `createRoot` on `#score-editor-root`, render `<ScoreEditorOverlay>` with `visible` prop toggled.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/score-editor/types.ts` | `PlacedNote`, `InventoryNote`, `EditorAttackTag`, `NoteDuration`, `EditorAction` |
| `src/score-editor/conversion.ts` | Bidirectional conversion: `PlacedNote[]` ↔ `ScoreNote[]` |
| `src/score-editor/ScoreEditorOverlay.tsx` | Root component with `useReducer`, drag state, overlay layout |
| `src/score-editor/Staff.tsx` | Grid of `StaffLine` components |
| `src/score-editor/StaffCell.tsx` | Individual cell / drop target |
| `src/score-editor/Inventory.tsx` | Inventory panel with draggable chips |
| `src/score-editor/DragGhost.tsx` | Floating note that follows pointer |
| `src/score-editor/score-editor.css` | All styles (`.se-` prefix) |
| `src/score-editor/mount.ts` | `createRoot`, `renderScoreEditor()` function called from `main.ts` |

## Files to Modify

| File | Change |
|------|--------|
| `index.html` | Add `<div id="score-editor-root"></div>` after `<canvas>` |
| `src/main.ts` | Import mount, Tab listener, pause/resume, onApply/onCancel |
| `tsconfig.app.json` | Add `"jsx": "react-jsx"` |
| `vite.config.ts` | Add `@vitejs/plugin-react` |
| `package.json` | New deps (via npm install) |

---

## Milestones

### Milestone 1: React infrastructure + empty overlay
**Install deps, configure JSX/Vite, render a visible `<div>` over the canvas.**

- Install `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`
- Update `tsconfig.app.json` and `vite.config.ts`
- Add `#score-editor-root` div to `index.html`
- Create `mount.ts` that calls `createRoot` and renders a placeholder `<ScoreEditorOverlay>`
- Wire Tab key in `main.ts` to toggle overlay visibility and pause/resume game

**How to test**: Run game → press Tab → dark overlay appears with "Score Editor" text, game pauses and music stops. Press Tab again → overlay hides, game resumes.

### Milestone 2: Staff grid rendering
**Render the 4-line x 16-slot staff grid with measure dividers and line labels.**

- Create `types.ts` with all type definitions
- Create `Staff.tsx` and `StaffCell.tsx`
- Style with CSS Grid: labels on left, 16 cells per row, measure dividers every 4 slots
- Color-code each line by attack type

**How to test**: Open overlay → see a colored 4x16 grid with labeled lines (lightning, projectile, cloud, explosion) and visible measure separators.

### Milestone 3: Inventory panel + drag-and-drop placement
**Render inventory chips, implement pointer-based drag, place notes on the staff.**

- Create `Inventory.tsx` with chips showing type/duration/count
- Create `DragGhost.tsx`
- Implement `useReducer` with `place`/`remove`/`load` actions
- Pointer event handling: drag from inventory → drop on staff cell
- Validation: bounds checking, overlap detection, count > 0
- Click placed note to remove (returns to inventory)
- Multi-slot notes render with `grid-column: span N`

**How to test**: Drag a quarter note onto the staff → it appears in that cell, inventory count decreases. Drag a half note → spans 2 cells. Click a placed note → removed, count increases. Try invalid placement (overlap, overflow) → rejected.

### Milestone 4: Apply/Cancel + full game integration
**Convert editor state to `ScoreNote[]`, apply to `world.score.data`, load existing score on open.**

- Create `conversion.ts` with `editorStateToScoreNotes` and `scoreNotesToPlacedNotes`
- Apply button: convert → update `world.score.data` → close overlay → resume
- Cancel button: discard changes → close → resume
- On open: load current `world.score.data.notes` into editor state
- Remove hardcoded score from `main.ts` (start with empty score or a default)

**How to test**: Place notes → Apply → play game → attacks fire on the beats you placed. Reopen editor → your notes are shown on the staff. Cancel discards changes.

---

## Verification (End-to-End)

1. `npm run dev` starts without errors
2. Tab opens/closes editor, game pauses/resumes correctly
3. Drag notes from inventory onto staff, multi-slot notes span correctly
4. Invalid placements (overlap, overflow) are rejected
5. Apply updates the score — attacks fire at placed positions during gameplay
6. Reopen editor shows previously applied notes
7. Cancel preserves the old score
8. `npm run build` succeeds (type-checks pass)
