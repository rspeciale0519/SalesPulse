"use client"

import type React from "react"

import { forwardRef, useRef, useImperativeHandle, useCallback } from "react"
import { Input } from "@/components/ui/input"

interface FocusSafeInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
  maxLength?: number
  allowDecimals?: boolean
  suffix?: string
  [key: string]: any
}

export const FocusSafeInput = forwardRef<HTMLInputElement, FocusSafeInputProps>(
  ({ value, onChange, onBlur, className, placeholder, maxLength, allowDecimals = false, suffix, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => inputRef.current!, [])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        let cleanValue = inputValue

        // Clean the input based on type
        if (allowDecimals) {
          // Allow digits and one decimal point
          cleanValue = inputValue.replace(/[^\d.]/g, "")
          // Ensure only one decimal point
          const parts = cleanValue.split(".")
          if (parts.length > 2) {
            cleanValue = parts[0] + "." + parts.slice(1).join("")
          }
        } else {
          // Only allow digits
          cleanValue = inputValue.replace(/[^\d]/g, "")
        }

        // Call onChange with cleaned value
        onChange(cleanValue)
      },
      [onChange, allowDecimals],
    )

    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          className={className}
          placeholder={placeholder}
          maxLength={maxLength}
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

FocusSafeInput.displayName = "FocusSafeInput"
