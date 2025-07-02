'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Reusable function to handle automatic redirect to dashboard
  const setupDashboardRedirect = () => {
    const redirectTimer = setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
    
    // Return cleanup function
    return () => clearTimeout(redirectTimer)
  }

  useEffect(() => {
    const type = searchParams.get('type')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      setStatus('error')
      setMessage(errorDescription || 'An error occurred during confirmation')
    } else if (type === 'signup') {
      setStatus('success')
      setMessage('Your email has been confirmed successfully!')
      
      // Setup automatic redirect to dashboard
      return setupDashboardRedirect()
    } else {
      // Default success state for email confirmation
      setStatus('success')
      setMessage('Your email has been confirmed successfully!')
      
      // Setup automatic redirect to dashboard
      return setupDashboardRedirect()
    }
  }, [searchParams, router])

  const handleLoginRedirect = () => {
    router.push('/?login=true')
  }

  const handleDashboardRedirect = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 bg-opacity-80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirming...'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </CardTitle>
          <CardDescription className="text-base">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && (
            <>
              <div className="text-sm text-gray-600 text-center">
                <p>Welcome to SalesPulse!</p>
                <p>Your account is now active and ready to use.</p>
              </div>
              <p className="text-xs text-blue-600 text-center font-medium">
                Redirecting to dashboard in a moment...
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleDashboardRedirect}
                  className="w-full"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={handleLoginRedirect}
                className="w-full"
                size="lg"
              >
                Try Signing In
              </Button>
              <Button 
                asChild
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          )}
          {status === 'loading' && (
            <p className="text-sm text-gray-600 text-center">
              Please wait while we confirm your email address...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
