'use client';

import type React from 'react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPassword } from '@/lib/actions/auth-actions';
import type { AuthView } from '@/types/auth';

interface ForgotPasswordFormProps {
  setAuthView: Dispatch<SetStateAction<AuthView>>;
}

export function ForgotPasswordForm({ setAuthView }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isNoAccount, setIsNoAccount] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsNoAccount(false);

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsPending(true);

    try {
      const result = await forgotPassword(email);

      if (result.error) {
        // Check if it's a "no account" error
        if (result.error.includes('No account found')) {
          setIsNoAccount(true);
        } else {
          setErrorMessage(result.error);
        }
      } else if (result.success) {
        setSuccessMessage(result.success);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Forgot password error:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-semibold text-center'>Forgot Password?</h2>
      <p className='text-sm text-muted-foreground text-center'>
        No worries, we&apos;ll send you reset instructions.
      </p>

      {errorMessage && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className='bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {isNoAccount && (
        <div className='mx-auto w-full max-w-full'>
          <div className='bg-red-50 bg-opacity-80 border border-red-200 rounded-md px-2 py-1 w-full max-w-full overflow-hidden'>
            <div className='text-center flex flex-col items-center justify-center py-1 w-full'>
              <span className='text-red-700 dark:text-red-400 font-semibold text-center w-full text-xs'>
                You don&apos;t have a SalesPulse account linked to this email.
              </span>
              <button
                onClick={() => setAuthView('signup')}
                className='text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-800 dark:hover:text-blue-300 mt-0.5 text-xs'
              >
                Sign up for free here
              </button>
            </div>
          </div>
        </div>
      )}

      {!isNoAccount && (
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='email-forgot'>Email</Label>
            <Input
              id='email-forgot'
              type='email'
              placeholder='m@example.com'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>
          <Button
            type='submit'
            className='w-full gradient-primary hover:opacity-90'
            disabled={isPending}
          >
            {isPending ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      )}

      <p className='text-center text-sm text-muted-foreground'>
        Remembered your password?{' '}
        <button
          onClick={() => setAuthView('login')}
          className='underline hover:text-primary font-medium'
          disabled={isPending}
        >
          Back to Login
        </button>
      </p>
    </div>
  );
}
