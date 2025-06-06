"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Import SVG icons directly for better control over official branding
import type { Dispatch, SetStateAction } from "react"
import type { AuthView, TwoFactorAuthMethod, User } from "@/types/auth" // Added User and TwoFactorAuthMethod
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface LoginFormProps {
  setAuthView: Dispatch<SetStateAction<AuthView>>
  onLoginSuccessWith2FA: (method: TwoFactorAuthMethod) => void // New prop
  onLoginSuccessWithout2FA: () => void // New prop
}

export function LoginForm({ setAuthView, onLoginSuccessWith2FA, onLoginSuccessWithout2FA }: LoginFormProps) {
  // Initialize Supabase client
  const supabase = createClientComponentClient()

  // Handle social login
  const handleSocialLogin = async (provider: "google" | "facebook" | "twitter") => {
    try {
      // Show loading state or disable the button here if needed
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error(`${provider} login failed:`, error.message)
        alert(`${provider} login failed. Please try again.`)
      }
      
      // The redirect happens automatically, no need to do anything else
    } catch (err) {
      console.error(`Error during ${provider} login:`, err)
      alert(`An error occurred. Please try again.`)
    }
  }
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // TODO: Replace with actual Supabase authentication
    console.log("Login form submitted, attempting to authenticate...")
    const email = (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value
    const password = (event.currentTarget.elements.namedItem("password") as HTMLInputElement).value

    // TODO: Implement real authentication with Supabase
    // Example implementation:
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // })
    // 
    // if (error) {
    //   console.error("Login failed:", error.message)
    //   alert("Login failed. Please check your credentials.")
    //   return
    // }
    // 
    // Check if user has 2FA enabled in user metadata or profile
    // if (data.user?.user_metadata?.two_factor_enabled) {
    //   onLoginSuccessWith2FA(data.user.user_metadata.two_factor_method)
    // } else {
    //   onLoginSuccessWithout2FA()
    // }

    // Temporary placeholder - remove once Supabase auth is integrated
    alert("Login functionality pending Supabase integration")
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full gradient-primary hover:opacity-90">
          Login
        </Button>
      </form>

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
