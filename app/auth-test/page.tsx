"use client"

import { SignupForm } from "@/components/auth/signup-form"
import type { AuthView } from "@/types/auth"
import { useState } from "react"

export default function AuthTest() {
  // Use actual React state to match the expected Dispatch<SetStateAction<AuthView>> type
  const [authView, setAuthView] = useState<AuthView>("signup")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Authentication Test Page</h1>
      <div className="max-w-md mx-auto border p-6 rounded-lg shadow-md">
        <SignupForm setAuthView={setAuthView} />
      </div>
    </div>
  )
}
