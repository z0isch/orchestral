import { useState, useEffect, useCallback, useRef } from 'react'
import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import { useStoreFields } from './useStoreFields'

type Props = {
  schema: Record<string, unknown>
  store: Record<string, unknown[]>
  eid: number
}

export function ComponentEditor({ schema, store, eid }: Props) {
  const storeValues = useStoreFields(store, eid)
  const [formData, setFormData] = useState(storeValues)
  const editTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!editTimeout.current) {
      setFormData(storeValues)
    }
  }, [storeValues])

  const handleChange = useCallback(
    (e: { formData?: Record<string, unknown> }) => {
      if (!e.formData) return
      setFormData(e.formData)
      for (const [k, v] of Object.entries(e.formData)) {
        if (Array.isArray(store[k])) {
          store[k]![eid] = v as number
        }
      }
      if (editTimeout.current) clearTimeout(editTimeout.current)
      editTimeout.current = setTimeout(() => {
        editTimeout.current = null
      }, 500)
    },
    [store, eid]
  )

  return (
    <Form schema={schema as any} formData={formData} validator={validator} onChange={handleChange}>
      <></>
    </Form>
  )
}
