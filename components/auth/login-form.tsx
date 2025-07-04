"use client"

import type React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Captcha } from "@/components/ui/captcha"
// Import SVG icons directly for better control over official branding
import type { Dispatch, SetStateAction } from "react"
import type { AuthView, TwoFactorAuthMethod, User } from "@/types/auth" // Added User and TwoFactorAuthMethod
import { useToast } from "@/components/ui/use-toast"
import { authRateLimiter, getClientIdentifier } from "@/lib/rate-limiter"
import { signInWithCredentials } from "@/lib/actions/auth-actions"

interface LoginFormProps {
  setAuthView: Dispatch<SetStateAction<AuthView>>
  onLoginSuccessWith2FA: (method: TwoFactorAuthMethod) => void // New prop
  onLoginSuccessWithout2FA: () => void // New prop
}

// Define validation schema using Zod
const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Must be a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password is too long" })
})

// Infer TypeScript type from the schema
type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm({ setAuthView, onLoginSuccessWith2FA, onLoginSuccessWithout2FA }: LoginFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Initialize react-hook-form with zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  })
  
  // Track rate limiting state
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isBlocked: boolean
    remainingAttempts: number
    resetTime?: number
  }>({ isBlocked: false, remainingAttempts: 5 })
  
  // Track CAPTCHA state
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)

  // Handle social login
  const handleSocialLogin = async (provider: "google" | "facebook" | "twitter") => {
    try {
      setIsLoading(true)
      // TODO: Implement social login with server action
      // For now, show a message that social login is not implemented
      toast({
        variant: "destructive",
        title: "Not Implemented",
        description: `${provider} login is not yet implemented. Please use email/password login.`,
      })
    } catch (err) {
      console.error(`Error during ${provider} login:`, err)
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const onSubmit = async (data: LoginFormValues) => {
    const { email, password } = data
    const identifier = `${getClientIdentifier()}-${email.toLowerCase()}`
    
    // Check rate limiting before attempting login
    const rateLimitCheck = authRateLimiter.check(identifier)
    setRateLimitInfo(rateLimitCheck)
    
    if (rateLimitCheck.isBlocked) {
      const resetTimeStr = rateLimitCheck.resetTime 
        ? new Date(rateLimitCheck.resetTime).toLocaleTimeString()
        : 'later'
      
      toast({
        variant: "destructive",
        title: "Too Many Attempts",
        description: `Account temporarily locked due to too many failed login attempts. Please try again at ${resetTimeStr}.`,
      })
      return
    }
    
    // Check CAPTCHA if required
    if (showCaptcha && !captchaVerified) {
      toast({
        variant: "destructive",
        title: "CAPTCHA Required",
        description: "Please complete the security verification before continuing.",
      })
      return
    }
    
    setIsLoading(true)
    console.log("Login form submitted, attempting to authenticate...")

    try {
      console.log('🔍 [LOGIN FORM] Calling server action signInWithCredentials...')
      
      // Use server action instead of direct Supabase client
      const result = await signInWithCredentials({ email, password })
      
      console.log('🔍 [LOGIN FORM] Server action result:', result)
      
      if (!result.success) {
        console.error('❌ [LOGIN FORM] Login failed:', result.error)
        
        // Record failed attempt for rate limiting
        const newRateLimitInfo = authRateLimiter.recordAttempt(identifier)
        setRateLimitInfo(newRateLimitInfo)
        
        // Increment failed attempts and show CAPTCHA after 2 failed attempts
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)
        
        if (newFailedAttempts >= 2) {
          setShowCaptcha(true)
          setCaptchaVerified(false)
        }
        
        let errorMessage = result.error || "Login failed. Please check your credentials."
        
        // Add rate limiting context to error message
        if (newRateLimitInfo.remainingAttempts > 0) {
          errorMessage += ` (${newRateLimitInfo.remainingAttempts} attempts remaining)`
        } else if (newRateLimitInfo.isBlocked) {
          const resetTimeStr = newRateLimitInfo.resetTime 
            ? new Date(newRateLimitInfo.resetTime).toLocaleTimeString()
            : 'later'
          errorMessage = `Too many failed attempts. Account locked until ${resetTimeStr}.`
        }
        
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: errorMessage,
        })
        return
      }
      
      console.log('✅ [LOGIN FORM] Login successful, user:', result.user)
      
      // Clear rate limit and CAPTCHA state on successful login
      authRateLimiter.reset(identifier)
      setRateLimitInfo({ isBlocked: false, remainingAttempts: 5 })
      setFailedAttempts(0)
      setShowCaptcha(false)
      setCaptchaVerified(false)
      
      // Check if user has 2FA enabled
      if (result.user?.twoFactorEnabled) {
        onLoginSuccessWith2FA(result.user.twoFactorMethod || 'authenticator_app')
      } else {
        toast({
          title: "Success",
          description: "You have successfully logged in."
        })
        console.log('🔍 [LOGIN FORM] Calling onLoginSuccessWithout2FA...')
        onLoginSuccessWithout2FA()
      }
    } catch (err) {
      console.error("Login error:", err)
      
      // Record failed attempt for unexpected errors too
      const newRateLimitInfo = authRateLimiter.recordAttempt(identifier)
      setRateLimitInfo(newRateLimitInfo)
      
      // Increment failed attempts and show CAPTCHA after 2 failed attempts
      const newFailedAttempts = failedAttempts + 1
      setFailedAttempts(newFailedAttempts)
      
      if (newFailedAttempts >= 2) {
        setShowCaptcha(true)
        setCaptchaVerified(false)
      }
      
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your@email.com" 
                    type="email" 
                    {...field} 
                    aria-label="Email address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="********" 
                    type="password" 
                    {...field} 
                    aria-label="Password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Show CAPTCHA after failed attempts */}
          <Captcha
            isRequired={showCaptcha}
            onVerify={(isValid) => {
              setCaptchaVerified(isValid)
              if (isValid) {
                toast({
                  title: "Verification Successful",
                  description: "Security verification completed."
                })
              }
            }}
            className="mb-4"
          />
          
          <Button
            type="submit"
            className="w-full gradient-primary hover:opacity-90"
            disabled={isLoading || (showCaptcha && !captchaVerified)}
            aria-live="polite"
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </Button>
          
          {/* Show security notice when CAPTCHA is displayed */}
          {showCaptcha && (
            <div className="text-xs text-muted-foreground text-center mt-2">
              🔒 Additional security verification required due to multiple failed attempts
            </div>
          )}
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        {/* Google's official button styling */}
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
            </g>
          </svg>
          Sign in with Google
        </button>
        
        {/* Facebook's official button styling */}
        <button
          type="button"
          onClick={() => handleSocialLogin("facebook")}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#1877F2] rounded-md hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Continue with Facebook
        </button>
        
        {/* X's (Twitter's) official button styling */}
        <button
          type="button"
          onClick={() => handleSocialLogin("twitter")}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Sign in with X
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        <button onClick={() => setAuthView("forgot-password")} className="underline hover:text-primary font-medium">
          Forgot your password?
        </button>
      </p>

      <p className="text-center text-sm text-muted-foreground">
        {"Don't have an account? "}
        <button onClick={() => setAuthView("signup")} className="underline hover:text-primary font-medium">
          Sign up
        </button>
      </p>
    </div>
  )
}
