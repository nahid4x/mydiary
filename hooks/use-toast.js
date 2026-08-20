'use client'

import { useState, useCallback } from 'react'

let toastId = 0
const listeners = new Set()
let toastsState = []

function dispatch(action) {
  if (action.type === 'ADD') {
    toastsState = [action.toast, ...toastsState].slice(0, 5)
  } else if (action.type === 'DISMISS') {
    toastsState = toastsState.filter((t) => t.id !== action.id)
  }
  listeners.forEach((fn) => fn([...toastsState]))
}

export function toast({ title, description, variant = 'default', duration = 4000 }) {
  const id = ++toastId
  dispatch({ type: 'ADD', toast: { id, title, description, variant } })
  setTimeout(() => dispatch({ type: 'DISMISS', id }), duration)
  return id
}

export function useToast() {
  const [toasts, setToasts] = useState([...toastsState])

  const subscribe = useCallback(() => {
    listeners.add(setToasts)
    return () => listeners.delete(setToasts)
  }, [])

  useState(() => {
    listeners.add(setToasts)
    return () => listeners.delete(setToasts)
  })

  const dismiss = useCallback((id) => dispatch({ type: 'DISMISS', id }), [])

  return { toasts, dismiss }
}
