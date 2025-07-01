import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  console.log('🔍 [AUTH CALLBACK] Starting email confirmation callback...')
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  console.log('🔍 [AUTH CALLBACK] Confirmation code:', code ? 'Present' : 'Missing')
  
  // Initialize Supabase client with the newer @supabase/ssr package for Next.js 15+ compatibility
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
  
  if (code) {
    try {
      console.log('🔍 [AUTH CALLBACK] Exchanging code for session...')
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('❌ [AUTH CALLBACK] Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(new URL('/auth/confirm?error=exchange_failed&error_description=Failed to verify email confirmation. Please try again.', requestUrl.origin))
      }
      
      console.log('✅ [AUTH CALLBACK] Code exchange successful')
      
      // Get the current user
      console.log('🔍 [AUTH CALLBACK] Getting user information...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ [AUTH CALLBACK] Error getting user after code exchange:', userError)
        return NextResponse.redirect(new URL('/auth/confirm?error=user_fetch_failed&error_description=Failed to retrieve user information.', requestUrl.origin))
      }
      
      if (user) {
        console.log('✅ [AUTH CALLBACK] User authenticated:', user.id, user.email)
        console.log('🔍 [AUTH CALLBACK] User metadata:', JSON.stringify(user.user_metadata, null, 2))
        
        // Check if user already has a profile
        console.log('🔍 [AUTH CALLBACK] Checking for existing user profile...')
        const { data: existingProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        // If no profile exists, create one
        if (!existingProfile && (!profileError || profileError.code === 'PGRST116')) {
          console.log('🔍 [AUTH CALLBACK] No existing profile found, creating new user profile for:', user.email)
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''
          const orgName = user.user_metadata?.organization_name || 'Personal Organization'
          
          console.log('🔍 [AUTH CALLBACK] Profile data:', { fullName, orgName })
          
          // Call our initialize_user_profile function
          console.log('🔍 [AUTH CALLBACK] Calling initialize_user_profile RPC function...')
          const { error: initError } = await supabase.rpc('initialize_user_profile', {
            user_id: user.id,
            user_email: user.email,
            name: fullName,  // Changed from 'full_name' to 'name' to match updated function
            organization_name: orgName
          })
          
          if (initError) {
            console.error('❌ [AUTH CALLBACK] Error initializing user profile:', initError)
            console.error('❌ [AUTH CALLBACK] Init error details:', JSON.stringify(initError, null, 2))
            return NextResponse.redirect(new URL('/auth/confirm?error=profile_creation_failed&error_description=Account created but profile setup failed. Please contact support.', requestUrl.origin))
          }
          
          console.log('✅ [AUTH CALLBACK] User profile created successfully')
        } else if (profileError && profileError.code !== 'PGRST116') {
          console.error('❌ [AUTH CALLBACK] Error checking existing profile:', profileError)
        } else {
          console.log('✅ [AUTH CALLBACK] User profile already exists:', existingProfile?.name)
        }
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(new URL('/auth/confirm?error=unexpected_error&error_description=An unexpected error occurred during authentication.', requestUrl.origin))
    }
  }

  // Check if this is a signup confirmation
  const type = requestUrl.searchParams.get('type')
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // User is authenticated
    if (type === 'signup') {
      // New user signup confirmation - redirect to confirmation page
      return NextResponse.redirect(new URL('/auth/confirm?type=signup', requestUrl.origin))
    } else {
      // Existing user login - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    }
  } else {
    // Not authenticated or error occurred
    if (code) {
      // There was a code but session creation failed - show error on confirmation page
      return NextResponse.redirect(new URL('/auth/confirm?error=session_failed&error_description=Failed to create session. Please try signing in again.', requestUrl.origin))
    } else {
      // No code provided - redirect to home
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    }
  }
}
