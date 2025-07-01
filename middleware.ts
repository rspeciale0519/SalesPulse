import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Skip middleware for auth-related paths and external OAuth provider redirects
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.includes('callback') ||
    request.nextUrl.search.includes('code=') ||
    request.nextUrl.search.includes('provider=')
  ) {
    return NextResponse.next()
  }
  
  // Check if the request is for a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/admin') ||
                          request.nextUrl.pathname === '/goals' ||
                          request.nextUrl.pathname === '/activity' ||
                          request.nextUrl.pathname === '/settings' ||
                          request.nextUrl.pathname === '/reports' ||
                          request.nextUrl.pathname === '/calendar' ||
                          request.nextUrl.pathname === '/commissions' ||
                          request.nextUrl.pathname === '/leads' ||
                          request.nextUrl.pathname === '/tasks'

  if (isProtectedRoute) {
    // Create a response to modify
    const response = NextResponse.next()
    
    // Create a Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            // If the cookie is updated, update the cookies for the request and response
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name, options) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )
    
    try {
      // Check if the user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      
      // If there's no session, redirect to the landing page
      if (!session) {
        console.log('User not authenticated, redirecting to landing page')
        return NextResponse.redirect(new URL('/', request.url))
      }
      
      // User is authenticated, continue
      return response
    } catch (error) {
      console.error('Error checking authentication:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // Continue with the request if authenticated or not a protected route
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/goals/:path*',
    '/activity/:path*',
    '/settings/:path*',
    '/reports/:path*',
    '/calendar/:path*',
    '/commissions/:path*',
    '/leads/:path*',
    '/tasks/:path*',
    // Add other protected routes as needed
  ],
}
