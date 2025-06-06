"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface NavigationState {
  // User dashboard sidebar state
  userExpandedItems: string[]
  setUserExpandedItems: (items: string[]) => void
  toggleUserExpandedItem: (item: string) => void

  // Admin dashboard sidebar state
  adminExpandedItems: string[]
  setAdminExpandedItems: (items: string[]) => void
  toggleAdminExpandedItem: (item: string) => void

  // Navigation history for better UX
  lastVisitedPage: string | null
  setLastVisitedPage: (page: string) => void
}

export const useNavigationState = create<NavigationState>()(
  persist(
    (set, get) => ({
      // User dashboard state
      userExpandedItems: [],
      setUserExpandedItems: (items) => set({ userExpandedItems: items }),
      toggleUserExpandedItem: (item) =>
        set((state) => ({
          userExpandedItems: state.userExpandedItems.includes(item)
            ? state.userExpandedItems.filter((i) => i !== item)
            : [...state.userExpandedItems, item],
        })),

      // Admin dashboard state
      adminExpandedItems: [],
      setAdminExpandedItems: (items) => set({ adminExpandedItems: items }),
      toggleAdminExpandedItem: (item) =>
        set((state) => ({
          adminExpandedItems: state.adminExpandedItems.includes(item)
            ? state.adminExpandedItems.filter((i) => i !== item)
            : [...state.adminExpandedItems, item],
        })),

      // Navigation history
      lastVisitedPage: null,
      setLastVisitedPage: (page) => set({ lastVisitedPage: page }),
    }),
    {
      name: "navigation-state",
      partialize: (state) => ({
        userExpandedItems: state.userExpandedItems,
        adminExpandedItems: state.adminExpandedItems,
        lastVisitedPage: state.lastVisitedPage,
      }),
    },
  ),
)
