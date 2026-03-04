import { Staff } from './Staff'
import { PlacedNote } from './types'

type Props = {
  visible: boolean
  onApply: () => void
  onCancel: () => void
}

export function ScoreEditorOverlay({ visible, onApply, onCancel }: Props) {
  if (!visible) return null

  // Placeholder empty state — Milestone 3 will add useReducer and real state
  const placedNotes: PlacedNote[] = []

  return (
    <div className="se-overlay">
      <div className="se-panel">
        <div className="se-header">
          <span className="se-title">Score Editor</span>
          <div className="se-actions">
            <button className="se-btn se-btn-apply" onClick={onApply}>
              Apply
            </button>
            <button className="se-btn se-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
        <Staff placedNotes={placedNotes} />
      </div>
    </div>
  )
}
