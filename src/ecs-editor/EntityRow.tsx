import { useState, useEffect } from 'react'
import { hasComponent } from 'bitecs'
import z from 'zod'
import { allComponents, Name } from '../ecs/components'
import type { World } from '../ecs/world'
import { ComponentEditor } from './ComponentEditor'

function getEditorSchema(schema: z.ZodObject<any>) {
  const omit: Record<string, true> = {}
  for (const [k, v] of Object.entries(schema.shape)) {
    if ((v as any)._def?.type === 'set') omit[k] = true
  }
  const s = Object.keys(omit).length ? schema.omit(omit) : schema
  return z.toJSONSchema(s)
}

type Props = { world: World; eid: number }

export function EntityRow({ world, eid }: Props) {
  const [componentNames, setComponentNames] = useState<string[]>(() =>
    Object.entries(allComponents)
      .filter(([, { store }]) => hasComponent(world, eid, store))
      .map(([name]) => name)
  )

  useEffect(() => {
    const id = setInterval(() => {
      setComponentNames(prev => {
        const next = Object.entries(allComponents)
          .filter(([, { store }]) => hasComponent(world, eid, store))
          .map(([name]) => name)
        if (prev.length === next.length && prev.every((n, i) => n === next[i])) {
          return prev
        }
        return next
      })
    }, 100)
    return () => clearInterval(id)
  }, [world, eid])

  return (
    <details>
      <summary>
        {Name.value[eid] ?? 'Entity'} ({eid})
      </summary>
      {componentNames
        .filter(name => name !== 'name')
        .map(name => {
          const { store, schema } = allComponents[name as keyof typeof allComponents]
          return (
            <details key={name} className="component">
              <summary>{name}</summary>
              <ComponentEditor
                schema={getEditorSchema(schema)}
                store={store}
                eid={eid}
              />
            </details>
          )
        })}
    </details>
  )
}
