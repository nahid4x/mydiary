// hooks/use-ai-improve.js
'use client'
import { useState } from 'react'

export function useAiImprove() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function improve(text, mode) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode, language: 'auto' }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResult(data.data)
      return data.data
    } catch (err) {
      setError(err.message || "AI couldn't improve this entry right now.")
      return null
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
  }

  return { improve, loading, result, error, reset }
}