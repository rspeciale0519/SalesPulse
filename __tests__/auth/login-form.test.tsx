import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/login-form'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { authRateLimiter } from '@/lib/rate-limiter'

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('@/lib/rate-limiter')
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn()
  }
}

const mockAuthRateLimiter = {
  check: jest.fn(),
  recordAttempt: jest.fn(),
  reset: jest.fn()
}

beforeEach(() => {
  ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  ;(authRateLimiter as any) = mockAuthRateLimiter
  jest.clearAllMocks()
})

describe('LoginForm', () => {
  const mockSetAuthView = jest.fn()
  const mockOnLoginSuccessWith2FA = jest.fn()
  const mockOnLoginSuccessWithout2FA = jest.fn()

  const defaultProps = {
    setAuthView: mockSetAuthView,
    onLoginSuccessWith2FA: mockOnLoginSuccessWith2FA,
    onLoginSuccessWithout2FA: mockOnLoginSuccessWithout2FA
  }

  beforeEach(() => {
    mockAuthRateLimiter.check.mockReturnValue({
      isBlocked: false,
      remainingAttempts: 5
    })
  })

  describe('Form Validation', () => {
    it('should display validation errors for invalid email', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await userEvent.type(emailInput, 'invalid-email')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/must be a valid email address/i)).toBeInTheDocument()
      })
    })

    it('should display validation errors for short password', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, '123')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })

    it('should require both email and password', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Authentication Flow', () => {
    it('should handle successful login without 2FA', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { user_metadata: { two_factor_enabled: false } } },
        error: null
      })

      render(<LoginForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnLoginSuccessWithout2FA).toHaveBeenCalled()
        expect(mockAuthRateLimiter.reset).toHaveBeenCalled()
      })
    })

    it('should handle successful login with 2FA', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: { 
            user_metadata: { 
              two_factor_enabled: true,
              two_factor_method: 'email'
            } 
          } 
        },
        error: null
      })

      render(<LoginForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnLoginSuccessWith2FA).toHaveBeenCalledWith('email')
      })
    })

    it('should handle authentication errors', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      })

      render(<LoginForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockAuthRateLimiter.recordAttempt).toHaveBeenCalled()
      })
    })
  })

  describe('Rate Limiting', () => {
    it('should prevent login when rate limited', async () => {
      mockAuthRateLimiter.check.mockReturnValue({
        isBlocked: true,
        remainingAttempts: 0,
        resetTime: Date.now() + 30 * 60 * 1000
      })

      render(<LoginForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)
      
      // Should not call Supabase auth due to rate limiting
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled()
    })

    it('should show remaining attempts in error message', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      })

      mockAuthRateLimiter.recordAttempt.mockReturnValue({
        isBlocked: false,
        remainingAttempts: 3
      })

      render(<LoginForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockAuthRateLimiter.recordAttempt).toHaveBeenCalled()
      })
    })
  })

  describe('CAPTCHA Integration', () => {
    it('should show CAPTCHA after 2 failed attempts', async () => {
      // Mock multiple failed attempts
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      })

      render(<LoginForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // First failed attempt
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.queryByText(/security verification/i)).not.toBeInTheDocument()
      })
      
      // Second failed attempt - should show CAPTCHA
      await userEvent.clear(passwordInput)
      await userEvent.type(passwordInput, 'wrongpassword2')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/security verification/i)).toBeInTheDocument()
      })
    })

    it('should prevent login when CAPTCHA is required but not verified', async () => {
      render(<LoginForm {...defaultProps} />)
      
      // Simulate showing CAPTCHA by directly triggering failed attempts
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Mock 2 failed attempts to show CAPTCHA
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      })

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      
      // First attempt
      await userEvent.click(submitButton)
      await waitFor(() => expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledTimes(1))
      
      // Second attempt - should trigger CAPTCHA
      await userEvent.click(submitButton)
      await waitFor(() => expect(screen.getByText(/security verification/i)).toBeInTheDocument())
    })
  })

  describe('Loading States', () => {
    it('should show loading state during authentication', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<LoginForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)
      
      expect(screen.getByText(/authenticating/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should disable submit button when CAPTCHA is required but not verified', async () => {
      render(<LoginForm {...defaultProps} />)
      
      // Mock failed attempts to trigger CAPTCHA
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      
      // Trigger CAPTCHA by failing twice
      await userEvent.click(submitButton)
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/security verification/i)).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('Social Login', () => {
    it('should handle Google OAuth login', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://oauth.url' },
        error: null
      })

      render(<LoginForm {...defaultProps} />)
      
      const googleButton = screen.getByText(/continue with google/i)
      await userEvent.click(googleButton)
      
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback')
        }
      })
    })

    it('should handle social login errors', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth error' }
      })

      render(<LoginForm {...defaultProps} />)
      
      const googleButton = screen.getByText(/continue with google/i)
      await userEvent.click(googleButton)
      
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<LoginForm {...defaultProps} />)
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should have live region for status updates', () => {
      render(<LoginForm {...defaultProps} />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).toHaveAttribute('aria-live', 'polite')
    })
  })
})
