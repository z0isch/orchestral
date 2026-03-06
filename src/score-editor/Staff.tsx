import { StaffCell } from './StaffCell'
import { LINE_CONFIG, TOTAL_SLOTS, PlacedNote } from './types'

type Props = {
  placedNotes: PlacedNote[]
  onNotePointerDown: (note: PlacedNote, x: number, y: number) => void
}

export function Staff({ placedNotes, onNotePointerDown }: Props) {
  return (
    <div className="se-staff">
      {LINE_CONFIG.map(({ line, label, color }) => {
        // Map each slot to the note starting there (if any), and track spanned slots
        const noteByStartSlot = new Map<number, PlacedNote>()
        const occupiedSlots = new Set<number>()
        for (const note of placedNotes) {
          if (note.line !== line) continue
          noteByStartSlot.set(note.startSlot, note)
          for (let s = note.startSlot; s < note.startSlot + note.duration; s++) {
            occupiedSlots.add(s)
          }
        }

        const cells: React.ReactNode[] = []
        for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
          const note = noteByStartSlot.get(slot)
          if (note) {
            cells.push(
              <StaffCell
                key={slot}
                line={line}
                slot={slot}
                color={color}
                placedNote={note}
                onNotePointerDown={onNotePointerDown}
              />
            )
            continue
          }
          if (occupiedSlots.has(slot)) continue // spanned by a multi-slot note
          cells.push(
            <StaffCell
              key={slot}
              line={line}
              slot={slot}
              color={color}
              placedNote={null}
              onNotePointerDown={onNotePointerDown}
            />
          )
        }

        return (
          <div key={line} className="se-staff-line">
            <div className="se-staff-label" style={{ color }}>
              {label}
            </div>
            <div className="se-staff-cells">{cells}</div>
          </div>
        )
      })}
    </div>
  )
}
