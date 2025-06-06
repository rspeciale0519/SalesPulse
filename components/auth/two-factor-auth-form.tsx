"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Dispatch, SetStateAction } from "react"
import type { AuthView, TwoFactorAuthMethod } from "@/types/auth" // We'll define this type

interface TwoFactorAuthFormProps {
  setAuthView: Dispatch<SetStateAction<AuthView>>
  method: TwoFactorAuthMethod | null
  onVerify: (code: string) => void // Callback to handle code verification
}

export function TwoFactorAuthForm({ setAuthView, method, onVerify }: TwoFactorAuthFormProps) {
  const [code, setCode] = React.useState("")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onVerify(code)
    // After verification, you'd typically close the modal or navigate the user
    console.log(`2FA code submitted: ${code} for method: ${method}`)
  }

  let instructionText = "Enter the verification code."
  const placeholderText = "123456"

  if (method === "sms") {
    instructionText = "Enter the code sent to your registered phone number."
  } else if (method === "email") {
    instructionText = "Enter the code sent to your email address."
  } else if (method === "authenticator_app") {
    instructionText = "Enter the code from your authenticator app."
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{instructionText}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="2fa-code">Verification Code</Label>
          <Input
            id="2fa-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={placeholderText}
            required
            autoComplete="one-time-code"
            pattern="\d{6}" // Common pattern for 6-digit codes
            title="Enter a 6-digit code"
          />
        </div>
        <Button type="submit" className="w-full gradient-primary hover:opacity-90">
          Verify Code
        </Button>
      </form>
      {method === "sms" || method === "email" ? (
        <Button variant="link" className="w-full" onClick={() => console.log("Resend code requested")}>
          Resend Code
        </Button>
      ) : null}
      <Button variant="outline" className="w-full" onClick={() => setAuthView("login")}>
        Back to Login
      </Button>
    </div>
  )
}
