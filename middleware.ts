import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Configuration constants for protected routes
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/goals',
  '/activity',
  '/settings',
  '/reports',
  '/calendar',
  '/commissions',
  '/leads',
  '/tasks'
] as const

// Exact auth-related paths that should bypass middleware
const AUTH_BYPASS_PATHS = [
  '/auth/login',
  '/auth/signup', 
  '/auth/callback',
  '/auth/reset-password',
  '/auth/confirm'
] as const

// Helper function to check if a path should bypass auth middleware
function shouldBypassAuthMiddleware(pathname: string, searchParams: string): boolean {
  // Check exact auth paths
  if (AUTH_BYPASS_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return true
  }
  
  // Check for OAuth callback parameters
  if (pathname === '/auth/callback' && (searchParams.includes('code=') || searchParams.includes('error='))) {
    return true
  }
  
  return false
}

// Helper function to check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Skip middleware for auth-related paths and OAuth flows
  if (shouldBypassAuthMiddleware(request.nextUrl.pathname, request.nextUrl.search)) {
    return NextResponse.next()
  }
  
  // Check if the request is for a protected route
  if (!isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

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
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // User is authenticated, continue
    return response
  } catch (error) {
    // Log error to server logs (production-ready logging should be implemented)
    // TODO: Replace with proper logging service (e.g., Winston, Pino, or cloud logging)
    if (process.env.NODE_ENV === 'development') {
      console.error('Authentication middleware error:', error)
    }
    return NextResponse.redirect(new URL('/', request.url))
  }
}

// Configure the middleware to run on specific paths
// Generate matcher patterns from PROTECTED_ROUTES constant
export const config = {
  matcher: PROTECTED_ROUTES.map(route => `${route}/:path*`)
}
