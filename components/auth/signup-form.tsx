"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Dispatch, SetStateAction } from "react"
import type { AuthView } from "@/types/auth" 
import { signUpWithCredentials } from "@/lib/actions/auth-actions"

interface SignupFormProps {
  setAuthView: Dispatch<SetStateAction<AuthView>> 
}

export function SignupForm({ setAuthView }: SignupFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }
    
    try {
      // Use our server action for signup with proper confirmation URL
      const result = await signUpWithCredentials({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
        organizationName: undefined // Let it default to "Personal Organization"
      })
      
      if (!result.success) {
        setError(result.error || "An error occurred during signup")
        return
      }
      
      // Success - show confirmation message
      setSuccess("Account created successfully! Please check your email for a confirmation link.")
      setError(null)
      
      // Optionally switch to login view after a delay
      setTimeout(() => {
        setAuthView("login")
      }, 3000)
      
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "An unexpected error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" type="text" placeholder="John" required />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" type="text" placeholder="Doe" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="m@example.com" 
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            title="Please enter a valid email address"
            required 
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
        </div>
        <Button type="submit" className="w-full gradient-primary hover:opacity-90" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {"Already have an account? "}
        <button onClick={() => setAuthView("login")} className="underline hover:text-primary font-medium">
          Log in
        </button>
      </p>
    </div>
  )
}
