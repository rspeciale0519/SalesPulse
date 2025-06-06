"use client"

import { useRef, useCallback, useEffect } from "react"

interface InputState {
  value: string
  isValid: boolean
  isDirty: boolean
}

interface InputConfig {
  allowDecimals?: boolean
  maxLength?: number
  min?: number
  max?: number
  required?: boolean
}

class InputManager {
  private inputs = new Map<string, InputState>()
  private configs = new Map<string, InputConfig>()
  private listeners = new Map<string, Set<(state: InputState) => void>>()
  private elements = new Map<string, HTMLInputElement>()

  registerInput(id: string, initialValue: string, config: InputConfig = {}) {
    this.inputs.set(id, {
      value: initialValue,
      isValid: true,
      isDirty: false,
    })
    this.configs.set(id, config)
    this.listeners.set(id, new Set())
  }

  unregisterInput(id: string) {
    this.inputs.delete(id)
    this.configs.delete(id)
    this.listeners.delete(id)
    this.elements.delete(id)
  }

  setElement(id: string, element: HTMLInputElement) {
    this.elements.set(id, element)
  }

  getValue(id: string): string {
    return this.inputs.get(id)?.value || ""
  }

  setValue(id: string, value: string, skipValidation = false) {
    const config = this.configs.get(id)
    const validatedValue = skipValidation ? value : this.validateValue(value, config)

    const state: InputState = {
      value: validatedValue,
      isValid: this.isValidValue(validatedValue, config),
      isDirty: true,
    }

    this.inputs.set(id, state)

    // Update DOM element directly
    const element = this.elements.get(id)
    if (element && element.value !== validatedValue) {
      const selectionStart = element.selectionStart
      const selectionEnd = element.selectionEnd
      element.value = validatedValue

      // Restore cursor position
      if (document.activeElement === element) {
        requestAnimationFrame(() => {
          element.setSelectionRange(selectionStart, selectionEnd)
        })
      }
    }

    // Notify listeners
    const listeners = this.listeners.get(id)
    if (listeners) {
      listeners.forEach((listener) => listener(state))
    }
  }

  subscribe(id: string, listener: (state: InputState) => void) {
    const listeners = this.listeners.get(id)
    if (listeners) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
    return () => {}
  }

  private validateValue(value: string, config: InputConfig = {}): string {
    if (value === "") return ""

    let cleaned = value

    if (config.allowDecimals) {
      // Allow digits and one decimal point
      cleaned = value.replace(/[^\d.]/g, "")
      const parts = cleaned.split(".")
      if (parts.length > 2) {
        cleaned = parts[0] + "." + parts.slice(1).join("")
      }
    } else {
      // Only allow digits
      cleaned = value.replace(/[^\d]/g, "")
    }

    // Apply length limit
    if (config.maxLength && cleaned.length > config.maxLength) {
      cleaned = cleaned.slice(0, config.maxLength)
    }

    return cleaned
  }

  private isValidValue(value: string, config: InputConfig = {}): boolean {
    if (config.required && !value) return false
    if (!value || value === ".") return true

    const numValue = config.allowDecimals ? Number.parseFloat(value) : Number.parseInt(value, 10)
    if (isNaN(numValue)) return false

    if (config.min !== undefined && numValue < config.min) return false
    if (config.max !== undefined && numValue > config.max) return false

    return true
  }

  applyLimits(id: string) {
    const state = this.inputs.get(id)
    const config = this.configs.get(id)

    if (!state || !config) return

    let { value } = state

    if (!value || value === ".") {
      value = "0"
    } else {
      const numValue = config.allowDecimals ? Number.parseFloat(value) : Number.parseInt(value, 10)
      if (!isNaN(numValue)) {
        if (config.min !== undefined && numValue < config.min) {
          value = config.min.toString()
        } else if (config.max !== undefined && numValue > config.max) {
          value = config.max.toString()
        }
      }
    }

    this.setValue(id, value, true)
  }
}

// Global instance
const globalInputManager = new InputManager()

export function useInputManager() {
  return globalInputManager
}

export function useInput(id: string, initialValue: string, config: InputConfig = {}) {
  const manager = useInputManager()
  const stateRef = useRef<InputState>({ value: initialValue, isValid: true, isDirty: false })

  useEffect(() => {
    manager.registerInput(id, initialValue, config)

    const unsubscribe = manager.subscribe(id, (state) => {
      stateRef.current = state
    })

    return () => {
      unsubscribe()
      manager.unregisterInput(id)
    }
  }, [id, initialValue, manager])

  const setValue = useCallback(
    (value: string) => {
      manager.setValue(id, value)
    },
    [id, manager],
  )

  const getValue = useCallback(() => {
    return manager.getValue(id)
  }, [id, manager])

  const applyLimits = useCallback(() => {
    manager.applyLimits(id)
  }, [id, manager])

  return {
    setValue,
    getValue,
    applyLimits,
    getState: () => stateRef.current,
  }
}
