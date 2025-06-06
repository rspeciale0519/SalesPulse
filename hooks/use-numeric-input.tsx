"use client"

import { useState, useCallback, useRef } from "react"

interface UseNumericInputOptions {
  initialValue?: number
  allowDecimals?: boolean
  min?: number
  max?: number
  onValueChange?: (value: number) => void
}

export function useNumericInput({
  initialValue = 0,
  allowDecimals = false,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  onValueChange,
}: UseNumericInputOptions = {}) {
  const [displayValue, setDisplayValue] = useState(initialValue.toString())
  const [numericValue, setNumericValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateInput = useCallback(
    (value: string): string => {
      if (allowDecimals) {
        // Allow digits and one decimal point
        return value.replace(/[^\d.]/g, "").replace(/(\..*?)\./g, "$1")
      } else {
        // Only allow digits
        return value.replace(/[^\d]/g, "")
      }
    },
    [allowDecimals],
  )

  const parseValue = useCallback(
    (value: string): number => {
      if (value === "" || value === ".") return 0
      const parsed = allowDecimals ? Number.parseFloat(value) : Number.parseInt(value, 10)
      if (isNaN(parsed)) return 0
      return Math.max(min, Math.min(max, parsed))
    },
    [allowDecimals, min, max],
  )

  const handleChange = useCallback(
    (value: string) => {
      const cleanValue = validateInput(value)
      setDisplayValue(cleanValue)

      const numeric = parseValue(cleanValue)
      setNumericValue(numeric)

      if (onValueChange) {
        onValueChange(numeric)
      }
    },
    [validateInput, parseValue, onValueChange],
  )

  const handleBlur = useCallback(() => {
    if (displayValue === "" || displayValue === ".") {
      setDisplayValue("0")
      setNumericValue(0)
      if (onValueChange) {
        onValueChange(0)
      }
    }
  }, [displayValue, onValueChange])

  const setValue = useCallback((value: number) => {
    setDisplayValue(value.toString())
    setNumericValue(value)
  }, [])

  const reset = useCallback(() => {
    setDisplayValue("0")
    setNumericValue(0)
    if (onValueChange) {
      onValueChange(0)
    }
  }, [onValueChange])

  return {
    displayValue,
    numericValue,
    handleChange,
    handleBlur,
    setValue,
    reset,
    inputRef,
  }
}
