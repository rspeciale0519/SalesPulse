"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogClose } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { useEffect, useRef } from "react"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import { ForgotPasswordForm } from "./forgot-password-form"
import { TwoFactorAuthForm } from "./two-factor-auth-form" // New import
import type { AuthView, TwoFactorAuthMethod } from "@/types/auth" // New import

interface LoginModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function LoginModal({ isOpen, onOpenChange }: LoginModalProps) {
  const [authView, setAuthView] = useState<AuthView>("login")
  const [twoFactorMethod, setTwoFactorMethod] = useState<TwoFactorAuthMethod | null>(null)
  const router = useRouter()
  const initialFocusRef = useRef<HTMLElement | null>(null)

  const handleLoginSuccessWith2FA = (method: TwoFactorAuthMethod) => {
    setTwoFactorMethod(method)
    setAuthView("2fa")
  }

  const handleLoginSuccessWithout2FA = () => {
    // Handle successful login without 2FA (redirect to dashboard)
    console.log("Login successful without 2FA. Redirecting to dashboard.")
    onOpenChange(false) // Close the modal
    router.push("/dashboard") // Redirect to dashboard
  }

  const handle2FAVerification = (code: string) => {
    // Simulate 2FA code verification
    console.log(`Verifying 2FA code: ${code} for method: ${twoFactorMethod}`)
    // In a real app, call backend to verify code
    // If successful:
    console.log("2FA verification successful. Redirecting to dashboard.")
    onOpenChange(false) // Close the modal
    router.push("/dashboard") // Redirect to dashboard
    // If failed, show error message within TwoFactorAuthForm
  }

  const getDialogTitle = () => {
    switch (authView) {
      case "login":
        return "Welcome Back!"
      case "signup":
        return "Create an Account"
      case "forgot-password":
        return "Reset Your Password"
      case "2fa":
        return "Two-Factor Authentication"
      default:
        return ""
    }
  }

  const getDialogDescription = () => {
    switch (authView) {
      case "login":
        return "Sign in to access your SalesPulse dashboard."
      case "signup":
        return "Join SalesPulse to start hitting your sales targets."
      case "forgot-password":
        return "Enter your email to receive a password reset link."
      case "2fa":
        return `Enter the code from your ${twoFactorMethod === "authenticator_app" ? "authenticator app" : twoFactorMethod === "sms" ? "SMS message" : "email"}.`
      default:
        return ""
    }
  }

  // Handle keyboard navigation between forms
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape key to close modal
      if (e.key === "Escape" && isOpen) {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onOpenChange])

  // Focus management when view changes
  useEffect(() => {
    if (isOpen && initialFocusRef.current) {
      // Small delay to ensure the DOM is ready
      setTimeout(() => {
        initialFocusRef.current?.focus()
      }, 50)
    }
  }, [isOpen, authView])

  const [dialogTitleId, setDialogTitleId] = useState<string | undefined>(undefined);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          // Reset to login view when modal is closed
          setAuthView("login")
          setTwoFactorMethod(null)
        }
      }}
      aria-labelledby={dialogTitleId}
      aria-describedby="auth-dialog-description"
    >
      <DialogContent
        className="sm:max-w-[425px]"
        role="dialog"
        aria-modal="true"
        title={getDialogTitle()}
        onTitleId={setDialogTitleId}
      >
        <DialogHeader>
          <DialogDescription className="text-center" id="auth-dialog-description">{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {authView === "login" ? (
          <LoginForm
            setAuthView={setAuthView}
            onLoginSuccessWith2FA={handleLoginSuccessWith2FA}
            onLoginSuccessWithout2FA={handleLoginSuccessWithout2FA}
          />
        ) : authView === "signup" ? (
          <SignupForm setAuthView={setAuthView} />
        ) : authView === "forgot-password" ? (
          <ForgotPasswordForm setAuthView={setAuthView} />
        ) : authView === "2fa" ? (
          <TwoFactorAuthForm setAuthView={setAuthView} method={twoFactorMethod} onVerify={handle2FAVerification} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
