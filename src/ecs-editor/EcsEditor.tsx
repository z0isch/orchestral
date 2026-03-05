import { useState, useEffect } from 'react'
import { getAllEntities, hasComponent } from 'bitecs'
import z from 'zod'
import { allComponents } from '../ecs/components'
import type { World } from '../ecs/world'
import { ComponentEditor } from './ComponentEditor'
import './ecs-editor.css'

function getEditorSchema(schema: z.ZodObject<any>) {
  const omit: Record<string, true> = {}
  for (const [k, v] of Object.entries(schema.shape)) {
    if ((v as any)._def?.type === 'set') omit[k] = true
  }
  const s = Object.keys(omit).length ? schema.omit(omit) : schema
  return z.toJSONSchema(s)
}

function readStore(store: Record<string, unknown[]>, eid: number) {
  const out: Record<string, unknown> = {}
  for (const [k, arr] of Object.entries(store)) {
    if (Array.isArray(arr)) out[k] = arr[eid]
  }
  return out
}

function writeStore(
  store: Record<string, unknown[]>,
  eid: number,
  values: Record<string, unknown>
) {
  for (const [k, v] of Object.entries(values)) {
    if (Array.isArray(store[k])) store[k]![eid] = v as number
  }
}

function entityComponents(world: World, eid: number) {
  return Object.entries(allComponents).filter(([, { store }]) => hasComponent(world, eid, store))
}

type Props = { world: World; visible: boolean }

export function EcsEditor({ world, visible }: Props) {
  const [entities, setEntities] = useState<readonly number[]>([])

  useEffect(() => {
    if (!visible) return
    setEntities(getAllEntities(world))
    const id = setInterval(() => {
      setEntities(getAllEntities(world))
    }, 500)
    return () => clearInterval(id)
  }, [visible, world])

  if (!visible) return null

  return (
    <div className="ecs-editor">
      <h2>ECS Editor</h2>
      {entities.map(eid => {
        const comps = entityComponents(world, eid)
        if (comps.length === 0) return null
        return (
          <details key={eid}>
            <summary>Entity {eid}</summary>
            {comps.map(([name, { store, schema }]) => (
              <details key={name} className="component">
                <summary>{name}</summary>
                <ComponentEditor
                  schema={getEditorSchema(schema)}
                  value={readStore(store, eid)}
                  onApply={values => writeStore(store, eid, values)}
                />
              </details>
            ))}
          </details>
        )
      })}
    </div>
  )
}
