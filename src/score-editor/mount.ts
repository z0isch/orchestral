import { createRoot, Root } from 'react-dom/client'
import { createElement } from 'react'
import { ScoreEditorOverlay } from './ScoreEditorOverlay'
import { ScoreNote } from '../ecs/music-score'
import type { InventoryNote } from '../ecs/note-inventory'
import './score-editor.css'

let root: Root | null = null
let currentNotes: ScoreNote[] = []
let currentInventory: InventoryNote[] = []
let visible = false
let onApplyCallback: ((notes: ScoreNote[], inventory: InventoryNote[]) => void) | null = null

function render() {
  root!.render(
    createElement(ScoreEditorOverlay, {
      visible,
      initialNotes: currentNotes,
      initialInventory: currentInventory,
      onApply: (notes: ScoreNote[], inventory: InventoryNote[]) => onApplyCallback?.(notes, inventory),
    })
  )
}

export function mountScoreEditor(onApply: (notes: ScoreNote[], inventory: InventoryNote[]) => void): void {
  onApplyCallback = onApply

  const container = document.getElementById('score-editor-root')!
  root = createRoot(container)
  render()
}

export function showScoreEditor(notes: ScoreNote[], inventory: InventoryNote[]): void {
  currentNotes = [...notes]
  currentInventory = inventory.map(n => ({ ...n }))
  visible = true
  render()
}

export function hideScoreEditor(): void {
  visible = false
  render()
}
