import { DURATION_ICONS, PlacedNote } from './types'

type Props = {
  line: number
  slot: number
  color: string
  placedNote: PlacedNote | null
  onNotePointerDown: (note: PlacedNote, x: number, y: number) => void
}

export function StaffCell({ line, slot, color, placedNote, onNotePointerDown }: Props) {
  const isMeasureStart = slot % 4 === 0 && slot > 0

  return (
    <div
      className={`se-cell${isMeasureStart ? ' se-cell-measure-start' : ''}${placedNote ? ' se-cell-filled' : ''}`}
      data-line={line}
      data-slot={slot}
      style={
        placedNote
          ? {
              backgroundColor: color,
              gridColumn: `span ${placedNote.duration}`,
              cursor: 'grab',
            }
          : undefined
      }
      onPointerDown={
        placedNote
          ? e => {
              e.stopPropagation()
              onNotePointerDown(placedNote, e.clientX, e.clientY)
            }
          : undefined
      }
    >
      {placedNote && (
        <span className="se-cell-note-icon">{DURATION_ICONS[placedNote.duration]}</span>
      )}
    </div>
  )
}
