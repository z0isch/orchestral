import { useState, useEffect } from 'react'

export function useStoreFields(
  store: Record<string, unknown[]>,
  eid: number,
  pollMs = 17
): Record<string, unknown> {
  const [fields, setFields] = useState<Record<string, unknown>>(() => {
    const out: Record<string, unknown> = {}
    for (const [k, arr] of Object.entries(store)) {
      if (Array.isArray(arr)) out[k] = arr[eid]
    }
    return out
  })

  useEffect(() => {
    const id = setInterval(() => {
      setFields(prev => {
        let changed = false
        const next: Record<string, unknown> = {}
        for (const [k, arr] of Object.entries(store)) {
          if (!Array.isArray(arr)) continue
          const val = arr[eid]
          if (val !== prev[k]) changed = true
          next[k] = val
        }
        return changed ? next : prev
      })
    }, pollMs)
    return () => clearInterval(id)
  }, [store, eid, pollMs])

  return fields
}
