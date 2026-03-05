# Note Duration in Gameplay

## Context

The score editor supports quarter (1), half (2), and whole (4) notes via `NoteDuration`, but the conversion to `ScoreNote` drops duration — every note becomes a single-subbeat event. We need to:

1. Carry duration through to gameplay
2. Render sustained notes as capsules on the highway
3. Enqueue attacks on every subbeat of a held note (with chord resolution for overlapping holds)
4. Break combo if the player releases early

---

## Milestone 1: Data Model & Conversion

**Validate by**: placing half/whole notes in editor, saving, reloading — duration round-trips. Gameplay unchanged.

### Changes

- **[music-score.ts](src/ecs/music-score.ts)**: Add `durationSubBeats: number` to `ScoreNote`. Add `activeNotesAt(absoluteBeat, subBeat)` method that returns `{ note, isStart, subBeatIndex }[]` for all notes whose duration span covers the given position (using modular arithmetic over `loopBeats * 4` total subbeats).
- **[conversion.ts](src/score-editor/conversion.ts)**: `editorStateToScoreNotes` — map `note.duration` → `durationSubBeats`. `scoreNotesToPlacedNotes` — map `durationSubBeats` back to `NoteDuration` (clamp to 1|2|4).

---

## Milestone 2: Highway Rendering

**Validate by**: starting gameplay with half/whole notes — they appear as perspective-corrected capsules spanning their duration. Quarter notes remain circles.

### Changes

- **[render.ts](src/ecs/systems/render.ts)** (note rendering ~L140-208): For `durationSubBeats > 1`, compute `endTimeUntil = timeUntil - durationSubBeats / subdivisions` and draw a perspective-corrected trapezoid from `startY` to `endY` with lane-width scaling. Keep button label at the leading edge (closest to hit line). Apply same cooldown alpha logic. Quarter notes (`durationSubBeats === 1`) keep existing circle rendering.

---

## Milestone 3: Sustained Hold Gameplay

**Validate by**: holding a button through a half note → 2 attacks fire (one per subbeat). Releasing early → combo breaks. Two overlapping sustained notes → chord resolution on continuation subbeats.

### Changes

- **[world.ts](src/ecs/world.ts)**: Add `sustainedHolds: Map<ScoreNote, { lastProcessedSubBeat: number }>` to `world.score`.
- **[music-score.ts](src/ecs/systems/music-score.ts)**: Refactor to use `activeNotesAt()` instead of `notesAt()`.
  - **Starting notes** (`isStart: true`): existing grace-window logic unchanged. On hit, if `durationSubBeats > 1`, register in `sustainedHolds`.
  - **Continuation notes** (`isStart: false`): check `sustainedHolds` for the note, verify `buttons[note.button]` is held. If held → mark processed, award 50×combo points. If released → delete from `sustainedHolds`, reset combo to 0.
  - **Chord resolution on continuations**: group all continuation notes active on the same subbeat and call `resolveChord()` on them together (same as initial hits).
  - **Cleanup**: remove notes from `sustainedHolds` when they no longer appear in `activeNotesAt()`.

---

## Milestone 4: Visual Feedback for Active Holds

**Validate by**: holding a sustained note shows a brighter/glowing fill progressing through the capsule.

### Changes

- **[render.ts](src/ecs/systems/render.ts)**: When rendering a sustained note capsule, check `score.sustainedHolds.has(note)`. If active, draw a brighter overlay from the tail (hit line end) up to the current playhead position within the note, creating a "filling up" effect.

---

## Key Files

| File                                                             | Role                                 |
| ---------------------------------------------------------------- | ------------------------------------ |
| [src/ecs/music-score.ts](src/ecs/music-score.ts)                 | `ScoreNote` type, `activeNotesAt()`  |
| [src/score-editor/conversion.ts](src/score-editor/conversion.ts) | Duration round-trip                  |
| [src/ecs/world.ts](src/ecs/world.ts)                             | `sustainedHolds` state               |
| [src/ecs/systems/music-score.ts](src/ecs/systems/music-score.ts) | Hold detection, continuation attacks |
| [src/ecs/systems/render.ts](src/ecs/systems/render.ts)           | Capsule rendering, hold feedback     |

## Design Decisions

- **`activeNotesAt()` as new method** — keeps `notesAt()` intact for any other callers
- **Chord resolution on continuations** — overlapping sustained notes resolve as chords each subbeat
- **Combo breaks on early release** — incentivizes holding through full duration
- **ECS orthogonality preserved** — `musicScoreSystem` handles timing/hits, `attackSystem` spawns entities, render reads state only
