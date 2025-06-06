"use client"

import { useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"

interface DOMControlledInputProps {
  initialValue: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  maxLength?: number
  allowDecimals?: boolean
  suffix?: string
  min?: number
  max?: number
  [key: string]: any
}

export function DOMControlledInput({
  initialValue,
  onChange,
  className,
  placeholder,
  maxLength,
  allowDecimals = false,
  suffix,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  ...props
}: DOMControlledInputProps) {
  // Use refs to avoid React's rendering cycle
  const inputRef = useRef<HTMLInputElement>(null)
  const valueRef = useRef(initialValue)
  const observerRef = useRef<MutationObserver | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMounted = useRef(false)
  const isUserEditing = useRef(false)
  const selectionStartRef = useRef<number | null>(null)
  const selectionEndRef = useRef<number | null>(null)

  // Validate input without causing re-renders
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

  // Apply numeric limits
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

  // Setup input event handlers directly on the DOM
  const setupInputHandlers = useCallback(() => {
    if (!inputRef.current) return

    const input = inputRef.current

    // Store original value
    if (!isMounted.current) {
      input.value = valueRef.current
      isMounted.current = true
    }

    // Handle input changes directly
    const handleInput = (e: Event) => {
      isUserEditing.current = true

      // Save selection state
      selectionStartRef.current = input.selectionStart
      selectionEndRef.current = input.selectionEnd

      // Validate and update
      const newValue = validateInput(input.value)

      // Only update if different (to avoid cursor jumps)
      if (newValue !== input.value) {
        const cursorPos = selectionStartRef.current || 0
        const lengthDiff = newValue.length - input.value.length
        input.value = newValue

        // Restore cursor position
        requestAnimationFrame(() => {
          if (document.activeElement === input) {
            const newPos = Math.max(0, cursorPos + lengthDiff)
            input.setSelectionRange(newPos, newPos)
          }
        })
      }

      // Update ref and notify parent
      valueRef.current = newValue
      onChange(newValue)
    }

    // Handle blur for validation
    const handleBlur = () => {
      isUserEditing.current = false
      const validatedValue = applyLimits(input.value)
      input.value = validatedValue
      valueRef.current = validatedValue
      onChange(validatedValue)
    }

    // Handle focus
    const handleFocus = () => {
      isUserEditing.current = true
    }

    // Attach event listeners directly
    input.addEventListener("input", handleInput)
    input.addEventListener("blur", handleBlur)
    input.addEventListener("focus", handleFocus)

    // Return cleanup function
    return () => {
      input.removeEventListener("input", handleInput)
      input.removeEventListener("blur", handleBlur)
      input.removeEventListener("focus", handleFocus)
    }
  }, [onChange, validateInput, applyLimits])

  // Setup mutation observer to detect when React replaces our input
  useEffect(() => {
    if (!containerRef.current) return

    // Create observer to watch for DOM changes
    observerRef.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // React might have replaced our input, re-setup handlers
          const newInput = containerRef.current?.querySelector("input")
          if (newInput && newInput !== inputRef.current) {
            inputRef.current = newInput as HTMLInputElement

            // If user was editing, restore focus and selection
            if (isUserEditing.current) {
              newInput.focus()
              if (selectionStartRef.current !== null && selectionEndRef.current !== null) {
                requestAnimationFrame(() => {
                  newInput.setSelectionRange(selectionStartRef.current!, selectionEndRef.current!)
                })
              }
            }

            // Re-setup handlers
            setupInputHandlers()
          }
        }
      }
    })

    // Start observing
    observerRef.current.observe(containerRef.current, { childList: true, subtree: true })

    // Initial setup
    setupInputHandlers()

    // Cleanup
    return () => {
      observerRef.current?.disconnect()
    }
  }, [setupInputHandlers])

  // Update input value when initialValue changes and user is not editing
  useEffect(() => {
    if (!inputRef.current || isUserEditing.current) return

    if (initialValue !== valueRef.current) {
      inputRef.current.value = initialValue
      valueRef.current = initialValue
    }
  }, [initialValue])

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        type="text"
        defaultValue={initialValue}
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
