"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Dispatch, SetStateAction } from "react"
import type { AuthView, TwoFactorAuthMethod } from "@/types/auth"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface TwoFactorAuthFormProps {
  setAuthView: Dispatch<SetStateAction<AuthView>>
  method: TwoFactorAuthMethod | null
  onVerify: (token: string) => void // Callback to handle token verification
  email?: string // User email for email verification
  phone?: string // User phone for SMS verification
}

export function TwoFactorAuthForm({ setAuthView, method, onVerify, email, phone }: TwoFactorAuthFormProps) {
  const [token, setToken] = React.useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (token.trim().length !== 6) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid 6-digit verification code."
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Prepare verification parameters based on method
      let verifyParams: any = { type: method === "authenticator_app" ? "totp" : method };
      
      // Add the appropriate parameters based on the method
      if (method === "email" && email) {
        verifyParams.email = email;
        verifyParams.token = token;
      } else if (method === "sms" && phone) {
        verifyParams.phone = phone;
        verifyParams.token = token;
      } else if (method === "authenticator_app") {
        verifyParams.token = token;
      } else {
        throw new Error("Insufficient information for verification");
      }
      
      // Verify the OTP with Supabase
      const { error } = await supabase.auth.verifyOtp(verifyParams)
      
      if (error) {
        throw error;
      }
      
      // Call the onVerify callback to update the UI
      await onVerify(token)
      
      toast({
        title: "Success",
        description: "Verification successful."
      })
      
    } catch (error: any) {
      console.error("2FA verification error:", error)
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "The code you entered is invalid or has expired. Please try again or request a new code."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    
    try {
      // Get user session to extract email or phone
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.user) {
        throw new Error("No active session found");
      }
      
      const user = sessionData.session.user;
      const userEmail = user.email;
      const userPhone = user.phone;
      
      // Determine which channel to use
      if (method === "sms" && userPhone) {
        const { error } = await supabase.auth.resend({
          type: "sms",
          phone: userPhone,
        });
        
        if (error) throw error;
      } else if (method === "email" && userEmail) {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: userEmail,
        });
        
        if (error) throw error;
      } else {
        throw new Error("Unable to determine how to resend the code");
      }
      
      toast({
        title: "Code Resent",
        description: method === "sms" 
          ? "A new verification code has been sent to your phone."
          : "A new verification code has been sent to your email."
      })
    } catch (error: any) {
      console.error("Failed to resend code:", error)
      toast({
        variant: "destructive",
        title: "Failed to Resend Code",
        description: error.message || "We couldn't send you a new code. Please try again later."
      })
    } finally {
      setIsResending(false)
    }
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
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={placeholderText}
            required
            autoComplete="one-time-code"
            pattern="\d{6}" // Common pattern for 6-digit codes
            title="Enter a 6-digit code"
            aria-label="Two-factor authentication code"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full gradient-primary hover:opacity-90"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>
      {method === "sms" || method === "email" ? (
        <Button 
          variant="link" 
          className="w-full" 
          onClick={handleResendCode}
          disabled={isResending}
        >
          {isResending ? "Sending..." : "Resend Code"}
        </Button>
      ) : null}
      <Button variant="outline" className="w-full" onClick={() => setAuthView("login")}>
        Back to Login
      </Button>
    </div>
  )
}
