import { useState } from 'react'

export function useApiMutation<TBody extends object, TResult>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (url: string, method: 'POST' | 'PUT' | 'DELETE', body: TBody) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Request failed')
      }
      return payload.data as TResult
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
