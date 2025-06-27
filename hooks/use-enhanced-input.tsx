"use client"

import { useInputManager } from "@/hooks/use-input-manager"
import { useFocusPreservation } from "@/hooks/use-focus-preservation"

/**
 * Enhanced input hook that combines input management and focus preservation
 * for a complete input experience. This is a convenience hook that internally
 * uses both useInputManager and useFocusPreservation.
 * 
 * Use this hook when you need both input state management and focus preservation,
 * which is the common use case for numeric input components like BulletproofInput.
 * 
 * @returns The input manager instance from useInputManager
 */
export function useEnhancedInput() {
  // Get the input manager for state management and validation
  const inputManager = useInputManager()
  
  // Initialize focus preservation (side effect only)
  useFocusPreservation()
  
  // Return the input manager for component use
  return inputManager
}
