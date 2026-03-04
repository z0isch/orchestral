import { useReducer, useRef, useState } from 'react'
import { Staff } from './Staff'
import { Inventory } from './Inventory'
import { DragGhost } from './DragGhost'
import {
  PlacedNote,
  InventoryNote,
  EditorAction,
  EditorAttackTag,
  NoteDuration,
  LINE_CONFIG,
  TOTAL_SLOTS,
  DURATION_ICONS,
} from './types'
import { ScoreNote } from '../ecs/music-score'
import { editorStateToScoreNotes, scoreNotesToPlacedNotes } from './conversion'

// ---- State & Reducer -------------------------------------------------------

type EditorState = {
  placedNotes: PlacedNote[]
  inventory: InventoryNote[]
}

const DEFAULT_INVENTORY: InventoryNote[] = [
  { attackTag: 'lightning', duration: 1, count: 4 },
  { attackTag: 'lightning', duration: 2, count: 2 },
  { attackTag: 'lightning', duration: 4, count: 1 },
  { attackTag: 'projectile', duration: 1, count: 4 },
  { attackTag: 'projectile', duration: 2, count: 2 },
  { attackTag: 'projectile', duration: 4, count: 1 },
  { attackTag: 'cloud', duration: 1, count: 4 },
  { attackTag: 'cloud', duration: 2, count: 2 },
  { attackTag: 'cloud', duration: 4, count: 1 },
  { attackTag: 'explosion', duration: 1, count: 4 },
  { attackTag: 'explosion', duration: 2, count: 2 },
  { attackTag: 'explosion', duration: 4, count: 1 },
]

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.tag) {
    case 'place': {
      const note = action.note

      const invIdx = state.inventory.findIndex(
        i => i.attackTag === note.attackTag && i.duration === note.duration
      )
      if (invIdx === -1 || state.inventory[invIdx].count <= 0) return state

      if (note.startSlot + note.duration > TOTAL_SLOTS) return state

      const occupied = new Set<number>()
      for (const p of state.placedNotes) {
        if (p.line !== note.line) continue
        for (let s = p.startSlot; s < p.startSlot + p.duration; s++) {
          occupied.add(s)
        }
      }
      for (let s = note.startSlot; s < note.startSlot + note.duration; s++) {
        if (occupied.has(s)) return state
      }

      const newInventory = state.inventory.map((item, i) =>
        i === invIdx ? { ...item, count: item.count - 1 } : item
      )
      return { placedNotes: [...state.placedNotes, note], inventory: newInventory }
    }

    case 'remove': {
      const note = state.placedNotes.find(p => p.id === action.noteId)
      if (!note) return state
      const newInventory = state.inventory.map(item =>
        item.attackTag === note.attackTag && item.duration === note.duration
          ? { ...item, count: item.count + 1 }
          : item
      )
      return {
        placedNotes: state.placedNotes.filter(p => p.id !== action.noteId),
        inventory: newInventory,
      }
    }

    case 'load': {
      return { placedNotes: action.placedNotes, inventory: action.inventory }
    }

    default: {
      const x: never = action
      throw new Error(`Unreachable ${x}`)
    }
  }
}

// ---- Component -------------------------------------------------------------

// Only attackTag + duration needed synchronously in event handlers (no x/y)
type ActiveDrag = { attackTag: EditorAttackTag; duration: NoteDuration }

// Full drag state including initial pointer position for ghost placement
type DragState = ActiveDrag & { x: number; y: number }

type Props = {
  visible: boolean
  initialNotes: ScoreNote[]
  onApply: (notes: ScoreNote[]) => void
}

function computeInitialState(initialNotes: ScoreNote[]): EditorState {
  const placedNotes = scoreNotesToPlacedNotes(initialNotes)
  const inventory = DEFAULT_INVENTORY.map(item => {
    const usedCount = placedNotes.filter(
      p => p.attackTag === item.attackTag && p.duration === item.duration
    ).length
    return { ...item, count: Math.max(0, item.count - usedCount) }
  })
  return { placedNotes, inventory }
}

export function ScoreEditorOverlay({ visible, initialNotes, onApply }: Props) {
  const [state, dispatch] = useReducer(editorReducer, initialNotes, computeInitialState)

  // dragging state causes 2 renders (start + end); movement updates ghost via ref only
  const [dragging, setDragging] = useState<DragState | null>(null)
  const dragRef = useRef<ActiveDrag | null>(null)
  const ghostRef = useRef<HTMLDivElement>(null)

  if (!visible) return null

  function handleDragStart(note: InventoryNote, x: number, y: number) {
    dragRef.current = { attackTag: note.attackTag, duration: note.duration }
    setDragging({ attackTag: note.attackTag, duration: note.duration, x, y })
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!ghostRef.current || !dragRef.current) return
    ghostRef.current.style.left = `${e.clientX}px`
    ghostRef.current.style.top = `${e.clientY}px`
  }

  function handlePointerUp(e: React.PointerEvent) {
    const drag = dragRef.current
    dragRef.current = null
    setDragging(null)
    if (!drag) return

    const el = document.elementFromPoint(e.clientX, e.clientY)
    if (!el) return
    const cell = el.closest('[data-line][data-slot]')
    if (!cell) return

    const lineStr = cell.getAttribute('data-line')
    const slotStr = cell.getAttribute('data-slot')
    if (lineStr == null || slotStr == null) return

    const line = parseInt(lineStr, 10)
    const slot = parseInt(slotStr, 10)

    // Bounds check before indexing LINE_CONFIG
    if (line < 0 || line >= LINE_CONFIG.length) return
    if (slot < 0 || slot >= TOTAL_SLOTS) return

    // Reject drop on wrong line for this attack type
    if (LINE_CONFIG[line].attackTag !== drag.attackTag) return

    dispatch({
      tag: 'place',
      note: {
        id: `${Date.now()}-${Math.random()}`,
        attackTag: drag.attackTag,
        duration: drag.duration,
        startSlot: slot,
        line,
      },
    })
  }

  const draggingConfig = dragging ? LINE_CONFIG.find(c => c.attackTag === dragging.attackTag) : null

  return (
    <div className="se-overlay" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div className="se-panel">
        <div className="se-header">
          <span className="se-title">Score Editor</span>
          <div className="se-actions">
            <button
              className="se-btn se-btn-apply"
              onClick={() => onApply(editorStateToScoreNotes(state.placedNotes))}
            >
              Apply
            </button>
          </div>
        </div>
        <Staff
          placedNotes={state.placedNotes}
          onRemove={noteId => dispatch({ tag: 'remove', noteId })}
        />
        <Inventory inventory={state.inventory} onDragStart={handleDragStart} />
      </div>
      {dragging && draggingConfig && (
        <DragGhost
          ref={ghostRef}
          label={
            <>
              {DURATION_ICONS[dragging.duration]} {draggingConfig.label}
            </>
          }
          color={draggingConfig.color}
          initialX={dragging.x}
          initialY={dragging.y}
        />
      )}
    </div>
  )
}
