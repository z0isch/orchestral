import { createRoot, Root } from 'react-dom/client'
import { createElement } from 'react'
import { ScoreEditorOverlay } from './ScoreEditorOverlay'
import './score-editor.css'

let root: Root | null = null
let visible = false
let onApplyCallback: (() => void) | null = null
let onCancelCallback: (() => void) | null = null

function render() {
  root!.render(
    createElement(ScoreEditorOverlay, {
      visible,
      onApply: () => onApplyCallback?.(),
      onCancel: () => onCancelCallback?.(),
    })
  )
}

export function mountScoreEditor(
  onApply: () => void,
  onCancel: () => void
): void {
  onApplyCallback = onApply
  onCancelCallback = onCancel

  const container = document.getElementById('score-editor-root')!
  root = createRoot(container)
  render()
}

export function showScoreEditor(): void {
  visible = true
  render()
}

export function hideScoreEditor(): void {
  visible = false
  render()
}
