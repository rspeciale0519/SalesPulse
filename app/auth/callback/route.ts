import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
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
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      // If no profile exists, create one
      if (!existingProfile) {
        const fullName = user.user_metadata?.full_name || ''
        const orgName = user.user_metadata?.organization_name || 'Personal Organization'
        
        // Call our initialize_user_profile function
        await supabase.rpc('initialize_user_profile', {
          user_id: user.id,
          user_email: user.email,
          full_name: fullName,
          organization_name: orgName
        })
      }
    }
  }

  // Redirect authenticated users to the dashboard, others to the home page
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // User is authenticated, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  } else {
    // Not authenticated or error, redirect to home
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }
}
