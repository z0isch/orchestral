import { forwardRef } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  label: string
  color: string
  initialX: number
  initialY: number
}

export const DragGhost = forwardRef<HTMLDivElement, Props>(
  ({ label, color, initialX, initialY }, ref) => {
    return createPortal(
      <div
        ref={ref}
        className="se-drag-ghost"
        style={{ backgroundColor: color, left: initialX, top: initialY }}
      >
        {label}
      </div>,
      document.body
    )
  }
)

DragGhost.displayName = 'DragGhost'
