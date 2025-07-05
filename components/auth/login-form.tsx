"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Captcha } from "@/components/ui/captcha"
import { EyeIcon, EyeOffIcon } from "lucide-react"
// Import reusable social icon components
import { GoogleIcon, FacebookIcon, XIcon } from '@/components/icons/social-icons'
import type { Dispatch, SetStateAction } from "react"
import type { AuthView, TwoFactorAuthMethod, User } from "@/types/auth" // Added User and TwoFactorAuthMethod
import { useToast } from "@/components/ui/use-toast"
import { authRateLimiter, getClientIdentifier } from "@/lib/rate-limiter"
import { signInWithCredentials, requestAccountUnlock } from "@/lib/actions/auth-actions"
import { createClient } from "@/lib/supabase/client"

interface LoginFormProps {
  setAuthView: Dispatch<SetStateAction<AuthView>>
  onLoginSuccessWith2FA: (method: TwoFactorAuthMethod) => void // New prop
  onLoginSuccessWithout2FA: () => void // New prop
}

// Password validation criteria
const PASSWORD_MIN_LENGTH = 8;
const HAS_LOWERCASE = /[a-z]/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SYMBOL = /[^A-Za-z0-9]/;

// Define validation schema using Zod
const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Must be a valid email address" }),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, { message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` })
    .max(100, { message: "Password is too long" })
    .refine(value => HAS_LOWERCASE.test(value), {
      message: "Password must include at least one lowercase letter",
    })
    .refine(value => HAS_UPPERCASE.test(value), {
      message: "Password must include at least one uppercase letter",
    })
    .refine(value => HAS_NUMBER.test(value), {
      message: "Password must include at least one number",
    })
    .refine(value => HAS_SYMBOL.test(value), {
      message: "Password must include at least one special character",
    })
})

// Infer TypeScript type from the schema
type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm({ setAuthView, onLoginSuccessWith2FA, onLoginSuccessWithout2FA }: LoginFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
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
  
  // Debug logging for captcha state (development only)
  useEffect(() => {
    if (showCaptcha && process.env.NODE_ENV === 'development') {
      console.log('🔍 [LOGIN FORM] Captcha state:', { captchaVerified, showCaptcha })
    }
  }, [captchaVerified, showCaptcha])
  
  // Track login error state
  const [loginError, setLoginError] = useState<{
    message: string;
    type?: 'email_not_found' | 'incorrect_password' | 'account_locked' | 'social_login' | 'other';
  } | null>(null)
  
  // Track account locked state
  const [isAccountLocked, setIsAccountLocked] = useState(false)
  const [unlockRequestSent, setUnlockRequestSent] = useState(false)

  // Handle social login
  const handleSocialLogin = async (provider: "google" | "facebook" | "twitter") => {
    try {
      setIsLoading(true)
      
      // Use client-side Supabase to avoid Next.js Server Actions security restrictions
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?type=social`
        }
      })
      
      if (error) {
        console.error(`Error during ${provider} OAuth:`, error)
        setIsLoading(false)
        toast({
          variant: "destructive",
          title: "Login Error",
          description: error.message,
        })
        return
      }
      
      // If successful, the browser will redirect to the OAuth provider
      // Don't reset loading state here as we're about to redirect
      
    } catch (err) {
      console.error(`Error during ${provider} login:`, err)
      setIsLoading(false)
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during social login. Please try again.",
      })
    }
  }
  // Handle account unlock request
  const handleUnlockRequest = async () => {
    const email = form.getValues('email')
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address to request account unlock.",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Call server action to send unlock email
      const result = await requestAccountUnlock(email)
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Request Failed",
          description: result.error,
        })
        return
      }
      setUnlockRequestSent(true)
      toast({
        title: "Unlock Request Sent",
        description: result.success || `Instructions to unlock your account have been sent to ${email}.`,
      })
    } catch (err) {
      console.error('Error sending unlock request:', err)
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "Failed to send unlock request. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const onSubmit = async (data: LoginFormValues) => {
    // Clear previous error state
    setLoginError(null)
    
    const { email, password } = data
    const identifier = `${getClientIdentifier()}-${email.toLowerCase()}`
    
    // Check rate limiting before attempting login
    const rateLimitCheck = authRateLimiter.check(identifier)
    setRateLimitInfo(rateLimitCheck)
    
    if (rateLimitCheck.isBlocked) {
      const resetTimeStr = rateLimitCheck.resetTime 
        ? new Date(rateLimitCheck.resetTime).toLocaleTimeString()
        : 'later'
      
      setIsAccountLocked(true)
      setLoginError({
        message: `Account temporarily locked due to too many failed login attempts. Please try again at ${resetTimeStr} or request an account unlock.`,
        type: 'account_locked'
      })
      
      return
    }
    
    // Check CAPTCHA if required
    if (showCaptcha && !captchaVerified) {
      setLoginError({
        message: "Please complete the security verification before continuing.",
        type: 'other'
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
        // Use info level for expected login failures instead of error
        console.info('🔍 [LOGIN FORM] Login attempt failed:', result.error)
        
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
        
        // Preserve the original error message for social login accounts
        // Only add rate limiting context for incorrect password errors
        if (result.errorType === 'incorrect_password' && newRateLimitInfo.remainingAttempts > 0) {
          errorMessage += ` (${newRateLimitInfo.remainingAttempts} attempts remaining)`
        }
        
        // Check if account is now locked due to too many attempts
        if (newRateLimitInfo.isBlocked) {
          const resetTimeStr = newRateLimitInfo.resetTime 
            ? new Date(newRateLimitInfo.resetTime).toLocaleTimeString()
            : 'later'
          errorMessage = `Too many failed attempts. Account locked until ${resetTimeStr}.`
          setIsAccountLocked(true)
          // Account is now locked
        }
        
        // Set the login error state with type
        setLoginError({
          message: errorMessage,
          type: newRateLimitInfo.isBlocked ? 'account_locked' : result.errorType
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
      console.info("Login attempt error:", err)
      
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
      {/* Display login error message */}
      {loginError && (
        <div className="p-3 border rounded-md bg-destructive/10 text-destructive">
           {loginError.type === 'account_locked' ? (
             <div className="flex flex-col items-center text-center">
               <span className="text-sm font-medium">Too many failed attempts.</span>
               <span className="text-xs font-medium">{loginError.message.replace('Too many failed attempts. ', '')}</span>
             </div>
           ) : (
             <p className="text-sm font-medium text-center">{loginError.message}</p>
           )}
           
          {/* Show account unlock request option if account is locked */}
           {isAccountLocked && !unlockRequestSent && (
            <div className="mt-2 flex justify-center">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleUnlockRequest}
                disabled={isLoading}
                className="text-xs"
              >
                {isLoading ? "Sending..." : "Request Account Unlock"}
              </Button>
            </div>
           )}
          
          {/* Show confirmation after unlock request is sent */}
          {unlockRequestSent && (
            <p className="text-xs mt-2">
              ✓ Unlock request sent. Please check your email for instructions.
            </p>
          )}
        </div>
      )}
      
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
                    disabled={isAccountLocked && unlockRequestSent}
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
                <div className="relative">
                  <FormControl>
                    <Input 
                      placeholder="********" 
                      type={showPassword ? "text" : "password"}
                      {...field} 
                      aria-label="Password"
                      disabled={isAccountLocked && unlockRequestSent}
                    />
                  </FormControl>
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    disabled={isAccountLocked && unlockRequestSent}
                  >
                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Show CAPTCHA after failed attempts */}
          <Captcha
            isRequired={showCaptcha}
            onVerify={(isValid) => {
              console.log('🔍 [LOGIN FORM] Captcha verification result:', isValid)
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
            disabled={isLoading || (showCaptcha && !captchaVerified) || (isAccountLocked && unlockRequestSent)}
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
          <GoogleIcon className="w-5 h-5 mr-2" />
          Sign in with Google
        </button>
        
        {/* Facebook's official button styling */}
        <button
          type="button"
          onClick={() => handleSocialLogin("facebook")}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#1877F2] rounded-md hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
          disabled={isLoading}
        >
          <FacebookIcon className="w-5 h-5 mr-2" />
          Continue with Facebook
        </button>
        
        {/* X's (Twitter's) official button styling */}
        <button
          type="button"
          onClick={() => handleSocialLogin("twitter")}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
          disabled={isLoading}
        >
          <XIcon className="w-5 h-5 mr-2" />
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
