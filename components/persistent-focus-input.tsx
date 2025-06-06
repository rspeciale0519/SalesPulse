"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"

interface PersistentFocusInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
  maxLength?: number
  allowDecimals?: boolean
  suffix?: string
  min?: number
  max?: number
  [key: string]: any
}

export function PersistentFocusInput({
  value: externalValue,
  onChange,
  onBlur,
  className,
  placeholder,
  maxLength,
  allowDecimals = false,
  suffix,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  ...props
}: PersistentFocusInputProps) {
  // Use internal state to avoid re-renders from parent
  const [internalValue, setInternalValue] = useState(externalValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const isFirstRender = useRef(true)
  const isUserEditing = useRef(false)
  const lastCursorPosition = useRef<number | null>(null)

  // Validate and clean input
  const validateInput = useCallback(
    (input: string): string => {
      if (input === "") return ""

      let cleaned = input

      if (allowDecimals) {
        // Allow digits and one decimal point
        cleaned = input.replace(/[^\d.]/g, "")
        const parts = cleaned.split(".")
        if (parts.length > 2) {
          cleaned = parts[0] + "." + parts.slice(1).join("")
        }
      } else {
        // Only allow digits
        cleaned = input.replace(/[^\d]/g, "")
      }

      // Apply length limit
      if (maxLength && cleaned.length > maxLength) {
        cleaned = cleaned.slice(0, maxLength)
      }

      return cleaned
    },
    [allowDecimals, maxLength],
  )

  // Apply numeric limits on blur
  const applyLimits = useCallback(
    (input: string): string => {
      if (!input || input === ".") return "0"

      const numValue = allowDecimals ? Number.parseFloat(input) : Number.parseInt(input, 10)

      if (isNaN(numValue)) return "0"

      if (numValue < min) return min.toString()
      if (numValue > max) return max.toString()

      return input
    },
    [allowDecimals, min, max],
  )

  // Handle input changes without losing focus
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      isUserEditing.current = true

      // Save cursor position
      lastCursorPosition.current = e.target.selectionStart

      // Clean the input
      const newValue = validateInput(e.target.value)

      // Update internal state immediately
      setInternalValue(newValue)

      // Notify parent component
      onChange(newValue)

      // Schedule cursor position restoration
      requestAnimationFrame(() => {
        if (inputRef.current && document.activeElement === inputRef.current) {
          const pos = lastCursorPosition.current || 0
          inputRef.current.setSelectionRange(pos, pos)
        }
      })
    },
    [onChange, validateInput],
  )

  const handleBlur = useCallback(() => {
    isUserEditing.current = false

    // Apply limits and validation on blur
    const validatedValue = applyLimits(internalValue)

    // Update both internal and external state
    setInternalValue(validatedValue)
    onChange(validatedValue)

    if (onBlur) {
      onBlur()
    }
  }, [internalValue, onChange, onBlur, applyLimits])

  // Sync with external value when it changes (but not during user editing)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (!isUserEditing.current && externalValue !== internalValue) {
      setInternalValue(externalValue)
    }
  }, [externalValue, internalValue])

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={className}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="off"
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  )
}
