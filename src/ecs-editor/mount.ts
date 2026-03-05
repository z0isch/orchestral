import { createRoot, Root } from 'react-dom/client'
import { createElement } from 'react'
import { EcsEditor } from './EcsEditor'
import type { World } from '../ecs/world'

let root: Root | null = null
let currentWorld: World | null = null
let visible = false

function render() {
  root!.render(
    createElement(EcsEditor, { world: currentWorld!, visible })
  )
}

export function mountEcsEditor(world: World): void {
  currentWorld = world
  const container = document.getElementById('bitecs-editor-root')!
  root = createRoot(container)
  render()
}

export function toggleEcsEditor(): void {
  visible = !visible
  render()
}
