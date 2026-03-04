import { NoteDuration, PlacedNote } from './types'

type Props = {
  line: number
  slot: number
  color: string
  placedNote: PlacedNote | null
}

export function StaffCell({ line, slot, color, placedNote }: Props) {
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
            }
          : undefined
      }
    >
      {placedNote && <span className="se-cell-note-icon">{noteIcon(placedNote.duration)}</span>}
    </div>
  )
}

function noteIcon(duration: NoteDuration): string {
  switch (duration) {
    case 1:
      return '♩'
    case 2:
      return '𝅗𝅥'
    case 4:
      return '𝅝'
    default: {
      const x: never = duration
      throw new Error(`Unreachable ${x}`)
    }
  }
}
