import { useState, useEffect } from 'react'
import { getAllEntities } from 'bitecs'
import type { World } from '../ecs/world'
import { EntityRow } from './EntityRow'
import './ecs-editor.css'

type Props = { world: World; visible: boolean }

export function EcsEditor({ world, visible }: Props) {
  const [entities, setEntities] = useState<readonly number[]>([])

  useEffect(() => {
    if (!visible) return
    setEntities(getAllEntities(world))
    const id = setInterval(() => {
      setEntities(prev => {
        const next = getAllEntities(world)
        if (prev.length === next.length && prev.every((e, i) => e === next[i])) {
          return prev
        }
        return next
      })
    }, 100)
    return () => clearInterval(id)
  }, [visible, world])

  if (!visible) return null

  return (
    <div className="ecs-editor">
      <h2>ECS Editor</h2>
      {entities.map(eid => (
        <EntityRow key={eid} world={world} eid={eid} />
      ))}
    </div>
  )
}
