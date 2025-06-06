"use client"

import { usePathname } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"

export default function DebugPage() {
  const pathname = usePathname()
  const [windowPath, setWindowPath] = useState<string>("")
  const theme = useTheme()

  // Safely check window on client side
  useEffect(() => {
    setWindowPath(window.location.pathname)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Debug Page</h1>

      <div className="space-y-6">
        <div className="p-4 border rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Path Information:</h2>
          <p>
            <strong>usePathname():</strong> {pathname}
          </p>
          <p>
            <strong>window.location.pathname:</strong> {windowPath}
          </p>
          <p>
            <strong>Match?</strong> {pathname === windowPath ? "✓ Yes" : "✗ No"}
          </p>
        </div>

        <div className="p-4 border rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Theme Information:</h2>
          <p>
            <strong>Current Theme:</strong> {theme?.theme || "undefined"}
          </p>
          <p>
            <strong>Theme Available?</strong> {theme ? "✓ Yes" : "✗ No"}
          </p>
        </div>

        <div className="p-4 border rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Layout Elements:</h2>
          <p>
            <strong>Dashboard Sidebar:</strong>{" "}
            {document.querySelector('[data-testid="dashboard-sidebar"]') ? "✓ Present" : "✗ Missing"}
          </p>
          <p>
            <strong>Dashboard Header:</strong>{" "}
            {document.querySelector('[data-testid="dashboard-header"]') ? "✓ Present" : "✗ Missing"}
          </p>
        </div>
      </div>
    </div>
  )
}
