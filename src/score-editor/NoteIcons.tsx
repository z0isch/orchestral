import { CSSProperties } from 'react'

type Props = {
  className?: string
  style?: CSSProperties
}

export function QuarterNoteIcon({ className, style }: Props) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stem */}
      <rect x="16" y="2" width="2" height="16" />
      {/* Filled notehead */}
      <ellipse cx="10" cy="18" rx="6" ry="4" />
    </svg>
  )
}

export function HalfNoteIcon({ className, style }: Props) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stem */}
      <rect x="16" y="2" width="2" height="16" />
      {/* Open notehead */}
      <ellipse cx="10" cy="18" rx="6" ry="4" />
      <ellipse cx="10" cy="18" rx="4" ry="2.5" fill="var(--bg, #1a1a2e)" />
    </svg>
  )
}

export function WholeNoteIcon({ className, style }: Props) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Open notehead only, no stem */}
      <ellipse cx="12" cy="12" rx="8" ry="5" />
      <ellipse cx="12" cy="12" rx="5" ry="3" fill="var(--bg, #1a1a2e)" />
    </svg>
  )
}
