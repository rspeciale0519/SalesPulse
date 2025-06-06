"use client"

import { useRef, useCallback, useState } from "react"

export function useStableState<T>(initialValue: T) {
  const [state, setState] = useState(initialValue)
  const stateRef = useRef(initialValue)
  const listenersRef = useRef<Set<(value: T) => void>>(new Set())

  const setStableState = useCallback((newValue: T | ((prev: T) => T)) => {
    const value = typeof newValue === "function" ? (newValue as (prev: T) => T)(stateRef.current) : newValue

    if (value !== stateRef.current) {
      stateRef.current = value
      setState(value)

      // Notify any listeners
      listenersRef.current.forEach((listener) => listener(value))
    }
  }, [])

  const getStableState = useCallback(() => stateRef.current, [])

  const subscribe = useCallback((listener: (value: T) => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  return [state, setStableState, getStableState, subscribe] as const
}
