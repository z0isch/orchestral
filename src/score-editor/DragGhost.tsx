import { forwardRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  label: ReactNode
  color: string
  width: number
  initialX: number
  initialY: number
}

export const DragGhost = forwardRef<HTMLDivElement, Props>(
  ({ label, color, width, initialX, initialY }, ref) => {
    return createPortal(
      <div
        ref={ref}
        className="se-drag-ghost"
        style={{ backgroundColor: color, width, left: initialX, top: initialY }}
      >
        {label}
      </div>,
      document.body
    )
  }
)

DragGhost.displayName = 'DragGhost'
