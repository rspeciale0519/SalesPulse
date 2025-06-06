"use client"

import type React from "react"
import { useState, type Dispatch, type SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { forgotPassword } from "@/lib/actions/auth-actions" // Corrected import path
import type { AuthView } from "@/types/auth"

interface ForgotPasswordFormProps {
  setAuthView: Dispatch<SetStateAction<AuthView>>
}

export function ForgotPasswordForm({ setAuthView }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email) {
      toast.error("Please enter your email address.")
      return
    }
    setIsPending(true)
    try {
      const result = await forgotPassword(email)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
        // Optionally, switch back to login view or show a confirmation message
        // setAuthView("login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
      console.error("Forgot password error:", error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Forgot Password?</h2>
      <p className="text-sm text-muted-foreground text-center">No worries, we&apos;ll send you reset instructions.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email-forgot">Email</Label>
          <Input
            id="email-forgot"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
        </div>
        <Button type="submit" className="w-full gradient-primary hover:opacity-90" disabled={isPending}>
          {isPending ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <button
          onClick={() => setAuthView("login")}
          className="underline hover:text-primary font-medium"
          disabled={isPending}
        >
          Back to Login
        </button>
      </p>
    </div>
  )
}
