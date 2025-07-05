"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { checkExistingAccount, generateSocialLoginErrorMessage } from '@/lib/utils/auth-helpers'
import { authRateLimiter } from '@/lib/rate-limiter'

// Logging utility for development-only logging
const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args)
    } else {
      // In production, we might want to log errors to a monitoring service
      // but without sensitive user data
      const sanitizedArgs = args.map(arg => {
        if (typeof arg === 'string') {
          // Remove emails and other sensitive patterns
          return arg.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]')
        }
        return arg
      })
      
      // In a real production environment, you would send this to a proper logging service
      // For example: sentryCapture(sanitizedArgs)
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args)
    } else {
      // Similar production handling as with errors
      // But for warnings
    }
  }
}

// Send account unlock email (uses password reset as unlock mechanism)
export async function requestAccountUnlock(email: string): Promise<{ error?: string; success?: string }> {
  const maskedEmail = email.replace(/(.{1,3}).*@/, '$1***@');
  logger.log(`🔐 [DEBUG] Starting account unlock request for: ${maskedEmail}`);
  try {
    // First check if email exists
    const { createServiceRole } = await import('@/lib/supabase/server')
    const supabaseAdmin = await createServiceRole()
    logger.log(`🔐 [DEBUG] Created service role client`);
    
    // Verify user exists using the more efficient checkExistingAccount utility
    const { exists, userId, error: accountError } = await checkExistingAccount(email)
    
    if (accountError) {
      logger.error('🔐 [DEBUG] Error checking user existence:', accountError)
      return { error: 'Error verifying account.' }
    }
    
    if (!exists) {
      logger.log('🔐 [DEBUG] No user found with email:', email)
      // Don't reveal to potential attackers that the email doesn't exist
      return { success: 'If an account with this email exists, unlock instructions have been sent.' }
    }
    
    logger.log(`🔐 [DEBUG] Found user with ID: ${userId}`);
    
    // Try direct password reset approach instead of generateLink
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`
    })

    if (error) {
      logger.error('🔐 [DEBUG] Account unlock email error:', error)
      return { error: error.message }
    }

    logger.log('🔐 [DEBUG] Successfully sent password reset email as unlock mechanism');
    return { success: 'Account unlock instructions have been sent to your email address.' }
  } catch (err) {
    logger.error('🔐 [DEBUG] Unexpected error during account unlock email:', err)
    return { error: 'An unexpected error occurred. Please try again later.' }
  }
}

export async function forgotPassword(email: string): Promise<{ error?: string; success?: string }> {
  try {
    // Use service role client to check if user exists
    const { createServiceRole } = await import('@/lib/supabase/server')
    const supabaseAdmin = await createServiceRole()
    
    // Check if user exists by querying the users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()
    
    // If user not found (PGRST116 is "not found" error code)
    if (profileError && profileError.code === 'PGRST116') {
      return { 
        error: "No account found with this email address. Would you like to create a new account instead?" 
      }
    }
    
    // If there's a different error, log it but continue with standard flow
    if (profileError) {
      logger.warn('Error checking user profile, continuing with standard flow:', profileError)
    }

    // User exists (or we couldn't verify), proceed with password reset using regular client
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`
    })

    if (error) {
      logger.error('Password reset error:', error)
      return { error: error.message }
    }

    return { success: "Password reset link has been sent to your email address." }
  } catch (err) {
    logger.error('Unexpected error during password reset:', err)
    return { error: "An unexpected error occurred. Please try again later." }
  }
}

export async function verifyTwoFactorCode(
  userId: string,
  code: string,
  method: "authenticator_app" | "sms" | "email",
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  // For now, 2FA is not implemented in Phase 1
  // This will be implemented when 2FA is added to the system
  // Return success for structural integrity
  return { success: true }
}

export async function signInWithCredentials(credentials: {
  email: string
  password: string
}): Promise<{
  success: boolean
  error?: string
  errorType?: 'email_not_found' | 'incorrect_password' | 'account_locked' | 'social_login' | 'other'
  user?: {
    id: string
    email: string
    name: string
    twoFactorEnabled?: boolean
    twoFactorMethod?: "authenticator_app" | "sms" | "email"
  }
}> {
  logger.log('🔍 [AUTH DEBUG] Starting sign-in process for:', credentials.email)
  
  // Get lock duration from environment variable or use default of 30 minutes
  const envLockDuration = process.env.AUTH_ACCOUNT_LOCK_DURATION_MINUTES
  const LOCK_DURATION_MINUTES = envLockDuration && !isNaN(Number(envLockDuration)) 
    ? Number(envLockDuration) 
    : 30
  
  // First, check if the email exists
  const { createServiceRole } = await import('@/lib/supabase/server')
  const supabaseAdmin = await createServiceRole()
  
  // Check if user exists in auth.users using the more efficient checkExistingAccount utility
  const { exists, userId, providers, error: accountCheckError } = await checkExistingAccount(credentials.email)
  
  // Convert to the format expected by the rest of the function
  let matchingUsers: any[] = []
  if (exists && userId) {
    // Get complete user details when needed for account locking
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (userData?.user) {
      matchingUsers = [userData.user]
    }
  }
  
  const userCheckError = accountCheckError

  // First, check if account is locked via metadata
  if (matchingUsers.length > 0) {
    const candidate = matchingUsers[0]!
    const lockedUntilTs = candidate.user_metadata?.locked_until
    if (lockedUntilTs && Date.now() < lockedUntilTs) {
      const resetTime = new Date(lockedUntilTs).toLocaleTimeString()
      return {
        success: false,
        error: `Account temporarily locked until ${resetTime}. Please reset your password to unlock sooner.`,
        errorType: 'account_locked'
      }
    }
  }

  // Early detect social login if a matching user exists but has no email/password provider
  if (matchingUsers.length > 0) {
    const candidate = matchingUsers[0]!
    const hasEmailProvider = (candidate.identities ?? []).some((id: any) => id.provider === 'email')
    if (!hasEmailProvider) {
      // fall back to util to determine providers for robust detection
      const existingAccount = await checkExistingAccount(credentials.email)
      const socialProviders = existingAccount.providers.filter(p => p !== 'email')
      if (socialProviders.length > 0) {
        const errorMessage = generateSocialLoginErrorMessage(socialProviders)
        return {
          success: false,
          error: errorMessage,
          errorType: 'social_login'
        }
      }
    }
  }
  
  logger.log('🔍 [AUTH DEBUG] Email existence check completed:', {
    error: userCheckError ? userCheckError.message : 'None'
  })
  
  // If email doesn't exist, check if it's linked to a social login
  if (matchingUsers.length === 0 && !userCheckError) {
    // Email doesn't exist at all (social login checks already handled earlier)
    logger.log('🔍 [AUTH DEBUG] No matching user found for email:', credentials.email)
    return { 
      success: false, 
      error: `No account found with email ${credentials.email}. Please check your email or sign up for a new account.`,
      errorType: 'email_not_found'
    }
  }
  
  // Email exists, try to sign in
  const supabase = await createClient()
  logger.log('🔍 [AUTH DEBUG] Supabase client created')

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  logger.log('🔍 [AUTH DEBUG] Sign-in attempt result:')
  logger.log('   - Error:', error ? error.message : 'None')
  logger.log('   - User exists:', !!data.user)
  logger.log('   - Session exists:', !!data.session)

  // Define known error patterns for better maintainability
  const ERROR_PATTERNS = {
    INVALID_CREDENTIALS: {
      codes: ['401', 'invalid_grant'],
      messages: ['Invalid login credentials', 'Invalid user credentials']
    },
    RATE_LIMITED: {
      codes: ['429'],
      messages: ['rate limited', 'too many requests']
    }
  }
  
  if (error) {
    logger.error('❌ [AUTH DEBUG] Sign-in error:', error)

    // Helper function to check error against known patterns
    const matchesErrorPattern = (err: any, pattern: {codes: string[], messages: string[]}) => {
      // Check for error code match
      if (err.code && pattern.codes.some(code => err.code.toString().includes(code))) {
        return true
      }
      // Check for message match as fallback
      if (err.message && pattern.messages.some(msg => err.message.toLowerCase().includes(msg.toLowerCase()))) {
        return true
      }
      return false
    }
    
    // Handle invalid credentials specially to track failed attempts
    if (matchesErrorPattern(error, ERROR_PATTERNS.INVALID_CREDENTIALS)) {
      // We already have matchingUsers, so use the first one
      if (matchingUsers.length > 0 && matchingUsers[0]) {
        const user = matchingUsers[0]
        const userIdentifier = `login_attempt_${user.id}`
        const currentFailed = user.user_metadata?.failed_attempts ?? 0
        const newFailed = currentFailed + 1
        const MAX_FAILED_ATTEMPTS = 5
        
        /**
         * Batching Strategy for Failed Login Metadata Updates
         * 
         * Implements intelligent batching to reduce database writes while maintaining security.
         * Updates occur on: first attempt, lock threshold, every 3rd attempt, and hourly fallback.
         * 
         * See docs/authentication-batching-strategy.md for detailed implementation and benefits.
         */
        const shouldUpdateDatabase = 
          // 1. First failed attempt - always record to establish a baseline
          currentFailed === 0 ||
          // 2. Fifth attempt - critical security threshold that locks the account
          newFailed === MAX_FAILED_ATTEMPTS ||
          // 3. Every 3rd attempt between 1 and MAX-1 - periodic updates to track progression
          (newFailed < MAX_FAILED_ATTEMPTS && newFailed % 3 === 0) ||
          // 4. Time-based fallback - update at least once per hour for persistent tracking
          (!user.user_metadata?.last_failed_update || 
            Date.now() - user.user_metadata?.last_failed_update > 60 * 60 * 1000)

        // Record the attempt in the rate limiter
        const { isBlocked, resetTime } = authRateLimiter.recordAttempt(userIdentifier)
        
        // If the user should be blocked according to rate limiter or existing metadata
        const isAlreadyLocked = user.user_metadata?.locked_until && 
            Date.now() < user.user_metadata.locked_until

        if (isBlocked || isAlreadyLocked || newFailed >= MAX_FAILED_ATTEMPTS) {
          // Only update database if we need to modify the lock status or batch update counter
          if (shouldUpdateDatabase || !isAlreadyLocked) {
            const lockUntil = resetTime || (Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
            const updates = {
              failed_attempts: newFailed,
              locked_until: lockUntil,
              last_failed_update: Date.now()
            }

            await supabaseAdmin.auth.admin.updateUserById(user.id, {
              user_metadata: { ...user.user_metadata, ...updates }
            })
          }

          const resetTimeString = new Date(resetTime || user.user_metadata?.locked_until).toLocaleTimeString()
          return {
            success: false,
            error: `Account temporarily locked until ${resetTimeString}. Please reset your password to unlock sooner.`,
            errorType: 'account_locked'
          }
        } 
        
        // If not blocked but should update the failed counter in database
        if (shouldUpdateDatabase) {
          const updates = {
            failed_attempts: newFailed,
            last_failed_update: Date.now()
          }

          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: { ...user.user_metadata, ...updates }
          })
        }
      }

      return {
        success: false,
        error: "Incorrect password. Please try again or reset your password.",
        errorType: 'incorrect_password'
      }
    }

    // Handle generic rate limiting errors from Supabase
    if (error.message.includes('Too many requests')) {
      return {
        success: false,
        error: "Too many login attempts. Please wait a few minutes before trying again.",
        errorType: 'account_locked'
      }
    }

    // Handle email not confirmed (supabase message may vary)
    if (error.message.includes('Email not confirmed')) {
      return {
        success: false,
        error: "Please confirm your email before signing in.",
        errorType: 'other'
      }
    }

    // Fallback
    return { success: false, error: error.message, errorType: 'other' }
  }

  if (!data.user) {
    logger.error('❌ [AUTH DEBUG] No user returned from sign-in')
    return { success: false, error: "Invalid email or password." }
  }

  logger.log('✅ [AUTH DEBUG] User signed in successfully:')
  logger.log('   - User ID:', data.user.id)
  logger.log('   - Email:', data.user.email)
  logger.log('   - Email confirmed:', data.user.email_confirmed_at)
  logger.log('   - Session access token:', data.session?.access_token ? 'Present' : 'Missing')
  logger.log('   - Session expires at:', data.session?.expires_at)

  // Check session immediately after sign-in
  const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
  logger.log('🔍 [AUTH DEBUG] Session check after sign-in:')
  logger.log('   - Session error:', sessionError ? sessionError.message : 'None')
  logger.log('   - Current session exists:', !!currentSession)
  logger.log('   - Session user ID:', currentSession?.user?.id)

  // Get additional user profile data
  logger.log('🔍 [AUTH DEBUG] Fetching user profile...')
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('name, role, org_id')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    logger.error('❌ [AUTH DEBUG] Error fetching user profile:', profileError)
    // Still allow login even if profile fetch fails
  } else {
    logger.log('✅ [AUTH DEBUG] Profile fetched successfully:')
    logger.log('   - Name:', profile.name)
    logger.log('   - Role:', profile.role)
    logger.log('   - Org ID:', profile.org_id)
  }

  logger.log('✅ [AUTH DEBUG] Sign-in action completed successfully')

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.name || data.user.email!,
      twoFactorEnabled: false, // 2FA not implemented in Phase 1
    },
  }
}

export async function signUpWithCredentials(credentials: {
  email: string
  password: string
  name?: string
  organizationName?: string
}): Promise<{
  success: boolean
  error?: string
  user?: { id: string; email: string; name: string }
}> {
  // Check if account already exists with social login providers
  try {
    const existingAccount = await checkExistingAccount(credentials.email)
    
    // Handle errors from account checking
    if (existingAccount.error) {
      console.error('Account check failed:', existingAccount.error)
      // Continue with signup process if check fails - better to allow signup than block legitimate users
      // Log the specific error type for monitoring
      if (existingAccount.error.type === 'PERMISSION_ERROR') {
        console.warn('Permission error during account check - may need to review service role permissions')
      }
    } else if (existingAccount.exists) {
      // Filter out 'email' provider to get only social providers
      const socialProviders = existingAccount.providers.filter(provider => provider !== 'email')
      
      if (socialProviders.length > 0) {
        // Account exists with social login providers - prevent signup
        const errorMessage = generateSocialLoginErrorMessage(socialProviders)
        return { success: false, error: errorMessage }
      }
      
      // Account exists but only with email/password - let Supabase handle the duplicate email error
    }
  } catch (checkError) {
    console.error('Unexpected error during account check:', checkError)
    // Continue with signup process if check fails - better to allow signup than block legitimate users
  }
  
  const supabase = await createClient()

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        name: credentials.name,  // Changed from 'full_name' to 'name' to match schema
        full_name: credentials.name,  // Keep both for compatibility
        organization_name: credentials.organizationName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=signup`
    }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data.user) {
    return { success: false, error: "Failed to create account." }
  }

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: credentials.name || data.user.email!,
    },
  }
}

// OAuth sign-in is now handled client-side in components/auth/login-form.tsx
// This server action has been removed to avoid Next.js server action security restrictions
// during OAuth redirects. Client-side implementation provides better user experience
// and avoids cross-origin redirect issues with server actions.

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get additional user profile data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    ...profile
  }
}
