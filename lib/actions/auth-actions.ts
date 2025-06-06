"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function forgotPassword(email: string): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "If an account with this email exists, a password reset link has been sent." }
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
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data.user) {
    return { success: false, error: "Invalid email or password." }
  }

  // Get additional user profile data
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role, org_id')
    .eq('id', data.user.id)
    .single()

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.full_name || data.user.email!,
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
        full_name: credentials.name,
        organization_name: credentials.organizationName,
      }
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
  redirect('/auth/login')
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
