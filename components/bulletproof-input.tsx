"use client"

import { useRef, useEffect, useCallback, memo } from "react"
import { Input } from "@/components/ui/input"
import { useInputManager } from "@/hooks/use-input-manager"

interface BulletproofInputProps {
  id: string
  initialValue: string
  onValueChange?: (value: string) => void
  className?: string
  placeholder?: string
  maxLength?: number
  allowDecimals?: boolean
  suffix?: string
  min?: number
  max?: number
  required?: boolean
  [key: string]: any
}

const BulletproofInput = memo(function BulletproofInput({
  id,
  initialValue,
  onValueChange,
  className,
  placeholder,
  maxLength,
  allowDecimals = false,
  suffix,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  required = false,
  ...props
}: BulletproofInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const manager = useInputManager()
  const isUserEditing = useRef(false)
  const lastNotifiedValue = useRef(initialValue)

  // Register input with manager
  useEffect(() => {
    manager.registerInput(id, initialValue, {
      allowDecimals,
      maxLength,
      min,
      max,
      required,
    })

    if (inputRef.current) {
      manager.setElement(id, inputRef.current)
      inputRef.current.value = initialValue
    }

    // Subscribe to value changes
    const unsubscribe = manager.subscribe(id, (state) => {
      if (onValueChange && state.value !== lastNotifiedValue.current) {
        lastNotifiedValue.current = state.value
        onValueChange(state.value)
      }
    })

    return () => {
      unsubscribe()
      manager.unregisterInput(id)
    }
  }, [id, initialValue, manager, onValueChange, allowDecimals, maxLength, min, max, required])

  // Handle input events directly on DOM
  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    const handleInput = (e: Event) => {
      isUserEditing.current = true
      const target = e.target as HTMLInputElement
      manager.setValue(id, target.value)
    }

    const handleFocus = () => {
      isUserEditing.current = true
    }

    const handleBlur = () => {
      isUserEditing.current = false
      manager.applyLimits(id)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent any potential React interference
      e.stopPropagation()
    }

    // Use capture phase to ensure we get events first
    input.addEventListener("input", handleInput, { capture: true })
    input.addEventListener("focus", handleFocus, { capture: true })
    input.addEventListener("blur", handleBlur, { capture: true })
    input.addEventListener("keydown", handleKeyDown, { capture: true })

    return () => {
      input.removeEventListener("input", handleInput, { capture: true })
      input.removeEventListener("focus", handleFocus, { capture: true })
      input.removeEventListener("blur", handleBlur, { capture: true })
      input.removeEventListener("keydown", handleKeyDown, { capture: true })
    }
  }, [id, manager])

  // Update element reference when input changes
  const setInputRef = useCallback(
    (element: HTMLInputElement | null) => {
      if (element) {
        inputRef.current = element
        manager.setElement(id, element)

        // Set initial value
        if (element.value !== initialValue) {
          element.value = initialValue
        }
      }
    },
    [id, manager, initialValue],
  )

  // Sync external value changes (but not during user editing)
  useEffect(() => {
    if (!isUserEditing.current && inputRef.current) {
      const currentValue = manager.getValue(id)
      if (currentValue !== initialValue) {
        manager.setValue(id, initialValue, true)
      }
    }
  }, [initialValue, id, manager])

  return (
    <div className="relative">
      <Input
        ref={setInputRef}
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
})

export { BulletproofInput }
