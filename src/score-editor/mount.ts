import { createRoot, Root } from 'react-dom/client'
import { createElement } from 'react'
import { ScoreEditorOverlay } from './ScoreEditorOverlay'
import { ScoreNote } from '../ecs/music-score'
import './score-editor.css'

let root: Root | null = null
let currentNotes: ScoreNote[] = []
let visible = false
let onApplyCallback: ((notes: ScoreNote[]) => void) | null = null

function render() {
  root!.render(
    createElement(ScoreEditorOverlay, {
      visible,
      initialNotes: currentNotes,
      onApply: (notes: ScoreNote[]) => onApplyCallback?.(notes),
    })
  )
}

export function mountScoreEditor(onApply: (notes: ScoreNote[]) => void): void {
  onApplyCallback = onApply

  const container = document.getElementById('score-editor-root')!
  root = createRoot(container)
  render()
}

export function showScoreEditor(notes: ScoreNote[]): void {
  currentNotes = [...notes]
  visible = true
  render()
}

export function hideScoreEditor(): void {
  visible = false
  render()
}
