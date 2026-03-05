import { useState, useEffect } from 'react'
import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'

type Props = {
  schema: Record<string, unknown>
  value: Record<string, unknown>
  onApply: (values: Record<string, unknown>) => void
}

export function ComponentEditor({ schema, value, onApply }: Props) {
  const [formData, setFormData] = useState(value)

  useEffect(() => {
    setFormData(value)
  }, [value])

  return (
    <Form
      schema={schema as any}
      formData={formData}
      validator={validator}
      onChange={e => {
        setFormData(e.formData)
        onApply(e.formData)
      }}
    >
      <></>
    </Form>
  )
}
