import { DURATION_ICONS, NoteDuration, LINE_CONFIG, CHIP_BASE_WIDTH } from './types'
import type { InventoryNote } from '../ecs/note-inventory'

const DURATIONS: NoteDuration[] = [1, 2, 4]

type Props = {
  inventory: InventoryNote[]
  onDragStart: (note: InventoryNote, x: number, y: number) => void
}

export function Inventory({ inventory, onDragStart }: Props) {
  return (
    <div className="se-inventory">
      <div className="se-inventory-title">Inventory</div>
      {DURATIONS.map(duration => (
        <div key={duration} className="se-inventory-row">
          {LINE_CONFIG.map(({ attackTag, color, label }) => {
            const item = inventory.find(i => i.attackTag === attackTag && i.duration === duration)
            const count = item?.count ?? 0
            const disabled = count === 0

            return (
              <div
                key={attackTag}
                className={`se-chip${disabled ? ' se-chip-empty' : ''}`}
                style={{ borderColor: color, width: CHIP_BASE_WIDTH * duration }}
                onPointerDown={
                  disabled
                    ? undefined
                    : e => {
                        e.preventDefault()
                        onDragStart({ attackTag, duration, count }, e.clientX, e.clientY)
                      }
                }
              >
                <span className="se-chip-icon" style={{ color }}>
                  {DURATION_ICONS[duration]}
                </span>
                <span className="se-chip-count">×{count}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
