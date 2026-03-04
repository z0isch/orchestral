import { ReactNode } from 'react'
import { NoteDuration } from './types'
import { QuarterNoteIcon, HalfNoteIcon, WholeNoteIcon } from './NoteIcons'

export const DURATION_ICONS: Record<NoteDuration, ReactNode> = {
  1: <QuarterNoteIcon />,
  2: <HalfNoteIcon />,
  4: <WholeNoteIcon />,
}
