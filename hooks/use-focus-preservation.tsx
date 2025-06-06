"use client"

import { useEffect, useRef } from "react"

class FocusPreservationManager {
  private activeElement: HTMLElement | null = null
  private selectionStart: number | null = null
  private selectionEnd: number | null = null
  private observers: MutationObserver[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.init()
    }
  }

  private init() {
    // Track focus changes
    document.addEventListener("focusin", this.handleFocusIn, true)
    document.addEventListener("focusout", this.handleFocusOut, true)

    // Track selection changes
    document.addEventListener("selectionchange", this.handleSelectionChange, true)

    // Observe DOM mutations that might affect focused elements
    this.setupMutationObserver()
  }

  private handleFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement
    if (target && target.tagName === "INPUT") {
      this.activeElement = target
      this.saveSelection()
    }
  }

  private handleFocusOut = (e: FocusEvent) => {
    // Don't clear if focus is moving to another input
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget || relatedTarget.tagName !== "INPUT") {
      this.activeElement = null
      this.selectionStart = null
      this.selectionEnd = null
    }
  }

  private handleSelectionChange = () => {
    if (this.activeElement && document.activeElement === this.activeElement) {
      this.saveSelection()
    }
  }

  private saveSelection() {
    if (this.activeElement && this.activeElement instanceof HTMLInputElement) {
      this.selectionStart = this.activeElement.selectionStart
      this.selectionEnd = this.activeElement.selectionEnd
    }
  }

  private setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          // Check if our focused element was removed or replaced
          if (this.activeElement && !document.contains(this.activeElement)) {
            this.restoreFocusToSimilarElement()
          }
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    this.observers.push(observer)
  }

  private restoreFocusToSimilarElement() {
    if (!this.activeElement) return

    // Find a similar input element (same class, same parent, etc.)
    const inputs = document.querySelectorAll("input")
    for (const input of inputs) {
      if (
        input.className === this.activeElement.className &&
        input.type === (this.activeElement as HTMLInputElement).type
      ) {
        // Found a similar element, restore focus
        requestAnimationFrame(() => {
          input.focus()
          if (this.selectionStart !== null && this.selectionEnd !== null && input instanceof HTMLInputElement) {
            input.setSelectionRange(this.selectionStart, this.selectionEnd)
          }
        })
        this.activeElement = input
        break
      }
    }
  }

  destroy() {
    document.removeEventListener("focusin", this.handleFocusIn, true)
    document.removeEventListener("focusout", this.handleFocusOut, true)
    document.removeEventListener("selectionchange", this.handleSelectionChange, true)

    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

let globalFocusManager: FocusPreservationManager | null = null

export function useFocusPreservation() {
  const managerRef = useRef<FocusPreservationManager | null>(null)

  useEffect(() => {
    if (!globalFocusManager) {
      globalFocusManager = new FocusPreservationManager()
    }
    managerRef.current = globalFocusManager

    return () => {
      // Don't destroy global manager, it should persist
    }
  }, [])

  return managerRef.current
}
