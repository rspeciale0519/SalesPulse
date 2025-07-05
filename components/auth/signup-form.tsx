"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Dispatch, SetStateAction } from "react"
import type { AuthView } from "@/types/auth" 
import { signUpWithCredentials } from "@/lib/actions/auth-actions"

interface SignupFormProps {
  setAuthView: Dispatch<SetStateAction<AuthView>> 
}

// Password validation criteria
const PASSWORD_MIN_LENGTH = 8;
const HAS_LOWERCASE = /[a-z]/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SYMBOL = /[^A-Za-z0-9]/;

// Password strength calculation
const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;

  let strength = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) strength += 20;
  if (HAS_LOWERCASE.test(password)) strength += 20;
  if (HAS_UPPERCASE.test(password)) strength += 20;
  if (HAS_NUMBER.test(password)) strength += 20;
  if (HAS_SYMBOL.test(password)) strength += 20;

  return strength; // 0 - 100 scale
};

// Get feedback message based on strength
const getPasswordFeedback = (password: string): { message: string; color: string; variant: 'weak' | 'moderate' | 'strong' | 'default' } => {
  if (!password) return { message: '', color: 'text-muted-foreground', variant: 'default' };

  const missing: string[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) missing.push('8+ characters');
  if (!HAS_LOWERCASE.test(password)) missing.push('lowercase letter');
  if (!HAS_UPPERCASE.test(password)) missing.push('uppercase letter');
  if (!HAS_NUMBER.test(password)) missing.push('number');
  if (!HAS_SYMBOL.test(password)) missing.push('symbol');

  const strength = calculatePasswordStrength(password);

  if (missing.length === 0) {
    return {
      message: 'Strong: Excellent password',
      color: 'text-green-500',
      variant: 'strong'
    };
  }

  // Build helpful feedback message
  const message = `Add ${missing.join(', ')}`;

  if (strength < 40) {
    return {
      message,
      color: 'text-destructive',
      variant: 'weak'
    };
  }

  return {
    message,
    color: 'text-yellow-500',
    variant: 'moderate'
  };
};

// Is password valid according to requirements
const isPasswordValid = (password: string): boolean => {
  return password.length >= PASSWORD_MIN_LENGTH &&
    HAS_LOWERCASE.test(password) && 
    HAS_UPPERCASE.test(password) &&
    HAS_NUMBER.test(password) && 
    HAS_SYMBOL.test(password);
};

export function SignupForm({ setAuthView }: SignupFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState<{ message: string; color: string; variant: 'weak' | 'moderate' | 'strong' | 'default' }>({ message: '', color: 'text-muted-foreground', variant: 'default' })

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
    setPasswordFeedback(getPasswordFeedback(password));
  }, [password]);

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
    
    // Validate password strength (use FormData password for consistency)
    if (!isPasswordValid(password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and symbol characters")
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
          <div className="relative">
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button 
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          
          {/* Password strength meter */}
          {password && (
            <div className="mt-2 space-y-1">
              <Progress 
                value={passwordStrength} 
                className="h-1" 
                variant={passwordFeedback.variant}
              />
              <p className={`text-xs ${passwordFeedback.color}`}>
                {passwordFeedback.message}
              </p>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
            <button 
              type="button"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
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
