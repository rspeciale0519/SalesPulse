"use client"

import type React from "react"

import { forwardRef, useLayoutEffect, useRef, useCallback, useState } from "react"
import { Input } from "@/components/ui/input"

interface StableNumericInputProps {
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

export const StableNumericInput = forwardRef<HTMLInputElement, StableNumericInputProps>(
  (
    {
      value,
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
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLInputElement>(null)
    const [isFocused, setIsFocused] = useState(false)
    const lastValidValue = useRef(value)

    // Use useLayoutEffect to maintain focus before browser repaints
    useLayoutEffect(() => {
      if (isFocused && internalRef.current && document.activeElement !== internalRef.current) {
        const input = internalRef.current
        const cursorPosition = input.selectionStart || 0
        input.focus()
        input.setSelectionRange(cursorPosition, cursorPosition)
      }
    })

    const validateAndCleanInput = useCallback(
      (inputValue: string): string => {
        if (inputValue === "") return ""

        let cleaned = inputValue

        if (allowDecimals) {
          // Allow digits, one decimal point, and handle multiple decimal points
          cleaned = inputValue.replace(/[^\d.]/g, "")
          const parts = cleaned.split(".")
          if (parts.length > 2) {
            cleaned = parts[0] + "." + parts.slice(1).join("")
          }
        } else {
          // Only allow digits
          cleaned = inputValue.replace(/[^\d]/g, "")
        }

        // Apply length limit
        if (maxLength && cleaned.length > maxLength) {
          cleaned = cleaned.slice(0, maxLength)
        }

        // Apply numeric limits
        if (cleaned && cleaned !== ".") {
          const numValue = allowDecimals ? Number.parseFloat(cleaned) : Number.parseInt(cleaned, 10)
          if (!isNaN(numValue)) {
            if (numValue < min) {
              cleaned = min.toString()
            } else if (numValue > max) {
              cleaned = max.toString()
            }
          }
        }

        return cleaned
      },
      [allowDecimals, maxLength, min, max],
    )

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        const cursorPosition = input.selectionStart || 0
        const inputValue = input.value

        // Store cursor position before validation
        const beforeLength = inputValue.length
        const cleanedValue = validateAndCleanInput(inputValue)
        const afterLength = cleanedValue.length

        // Calculate new cursor position after cleaning
        const lengthDiff = afterLength - beforeLength
        const newCursorPosition = Math.max(0, cursorPosition + lengthDiff)

        // Update the value
        onChange(cleanedValue)
        lastValidValue.current = cleanedValue

        // Restore cursor position after React updates
        requestAnimationFrame(() => {
          if (input && document.activeElement === input) {
            input.setSelectionRange(newCursorPosition, newCursorPosition)
          }
        })
      },
      [onChange, validateAndCleanInput],
    )

    const handleFocus = useCallback(() => {
      setIsFocused(true)
    }, [])

    const handleBlur = useCallback(() => {
      setIsFocused(false)

      // Handle empty or invalid values on blur
      if (value === "" || value === ".") {
        onChange("0")
      }

      if (onBlur) {
        onBlur()
      }
    }, [value, onChange, onBlur])

    // Combine refs
    const combinedRef = useCallback(
      (node: HTMLInputElement) => {
        internalRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    return (
      <div className="relative">
        <Input
          ref={combinedRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
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
  },
)

StableNumericInput.displayName = "StableNumericInput"
