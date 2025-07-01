"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

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
      console.warn('Error checking user profile, continuing with standard flow:', profileError)
    }

    // User exists (or we couldn't verify), proceed with password reset using regular client
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`
    })

    if (error) {
      console.error('Password reset error:', error)
      return { error: error.message }
    }

    return { success: "Password reset link has been sent to your email address." }
  } catch (err) {
    console.error('Unexpected error during password reset:', err)
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
  user?: {
    id: string
    email: string
    name: string
    twoFactorEnabled?: boolean
    twoFactorMethod?: "authenticator_app" | "sms" | "email"
  }
}> {
  console.log('🔍 [AUTH DEBUG] Starting sign-in process for:', credentials.email)
  
  const supabase = await createClient()
  console.log('🔍 [AUTH DEBUG] Supabase client created')

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  console.log('🔍 [AUTH DEBUG] Sign-in attempt result:')
  console.log('   - Error:', error ? error.message : 'None')
  console.log('   - User exists:', !!data.user)
  console.log('   - Session exists:', !!data.session)

  if (error) {
    console.error('❌ [AUTH DEBUG] Sign-in error:', error)
    // Provide more specific error messages
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: "Invalid email or password. Please check your credentials and try again." }
    } else if (error.message.includes('Email not confirmed')) {
      return { success: false, error: "Please check your email and click the confirmation link before signing in." }
    } else if (error.message.includes('Too many requests')) {
      return { success: false, error: "Too many login attempts. Please wait a few minutes before trying again." }
    }
    return { success: false, error: error.message }
  }

  if (!data.user) {
    console.error('❌ [AUTH DEBUG] No user returned from sign-in')
    return { success: false, error: "Invalid email or password." }
  }

  console.log('✅ [AUTH DEBUG] User signed in successfully:')
  console.log('   - User ID:', data.user.id)
  console.log('   - Email:', data.user.email)
  console.log('   - Email confirmed:', data.user.email_confirmed_at)
  console.log('   - Session access token:', data.session?.access_token ? 'Present' : 'Missing')
  console.log('   - Session expires at:', data.session?.expires_at)

  // Check session immediately after sign-in
  const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
  console.log('🔍 [AUTH DEBUG] Session check after sign-in:')
  console.log('   - Session error:', sessionError ? sessionError.message : 'None')
  console.log('   - Current session exists:', !!currentSession)
  console.log('   - Session user ID:', currentSession?.user?.id)

  // Get additional user profile data
  console.log('🔍 [AUTH DEBUG] Fetching user profile...')
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('name, role, org_id')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    console.error('❌ [AUTH DEBUG] Error fetching user profile:', profileError)
    // Still allow login even if profile fetch fails
  } else {
    console.log('✅ [AUTH DEBUG] Profile fetched successfully:')
    console.log('   - Name:', profile.name)
    console.log('   - Role:', profile.role)
    console.log('   - Org ID:', profile.org_id)
  }

  console.log('✅ [AUTH DEBUG] Sign-in action completed successfully')

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
