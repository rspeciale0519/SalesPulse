import { createServiceRole } from '@/lib/supabase/server'

// Provider URL patterns for social login detection
const PROVIDER_URL_PATTERNS = {
  google: ['googleusercontent.com', 'google.com'],
  facebook: ['facebook.com', 'fbcdn.net'],
  twitter: ['twimg.com', 'twitter.com', 'x.com'],
  github: ['githubusercontent.com', 'github.com']
} as const

// Type definitions for Supabase user identity
interface UserIdentity {
  provider: string
  id: string
  user_id: string
  identity_data?: Record<string, unknown>
  last_sign_in_at?: string
  created_at?: string
  updated_at?: string
}

// Type definition for Supabase user metadata
interface UserMetadata {
  providers?: string[]
  picture?: string
  avatar_url?: string
  email_verified?: boolean
  full_name?: string
  name?: string
  [key: string]: unknown
}

// Type definition for complete Supabase user object
interface SupabaseUser {
  id: string
  email?: string
  user_metadata: UserMetadata
  app_metadata: Record<string, unknown>
  email_confirmed_at?: string
  created_at: string
  updated_at?: string
  identities?: UserIdentity[]
}

export interface ExistingAccountInfo {
  exists: boolean
  providers: string[]
  userId?: string
  error?: {
    type: 'SUPABASE_ERROR' | 'NETWORK_ERROR' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR'
    message: string
    details?: unknown
  }
}

/**
 * Enhanced provider detection using specific patterns and user data analysis
 * Returns 'unknown' when provider cannot be confidently determined
 */
function detectProvidersFromUserData(user: SupabaseUser): string[] {
  const userMetadata = user.user_metadata
  const appMetadata = user.app_metadata
  
  // Check app_metadata for explicit provider information first
  if (appMetadata.provider && typeof appMetadata.provider === 'string') {
    return [appMetadata.provider]
  }
  
  // Check for specific social provider patterns using explicit field checks
  
  // Helper function to safely convert picture to string
  const getPictureUrl = (picture: unknown): string | null => {
    if (typeof picture === 'string') {
      return picture.toLowerCase()
    }
    if (picture && typeof picture === 'object' && 'toString' in picture) {
      try {
        return String(picture).toLowerCase()
      } catch {
        return null
      }
    }
    return null
  }
  
  // Check for provider-specific patterns using centralized URL patterns
  if (userMetadata.picture) {
    const pictureUrl = getPictureUrl(userMetadata.picture)
    if (pictureUrl) {
      // Iterate over provider patterns to find matches
      for (const [provider, patterns] of Object.entries(PROVIDER_URL_PATTERNS)) {
        const hasMatch = patterns.some(pattern => pictureUrl.includes(pattern))
        if (hasMatch) {
          // Provider detected from picture URL pattern
          return [provider]
        }
      }
    }
  }
  
  // General social login indicators (more reliable checks)
  const hasSocialIndicators = (
    userMetadata.picture !== undefined || 
    userMetadata.avatar_url !== undefined ||
    (userMetadata.email_verified === true && user.email_confirmed_at === user.created_at)
  )
  
  // If we have social indicators but can't determine the specific provider
  if (hasSocialIndicators && Object.keys(userMetadata).length > 0) {
    return ['unknown'] // Use 'unknown' for indeterminate social providers
  }
  
  // Default to email/password if no social indicators
  return ['email']
}

/**
 * Check if an account exists for the given email and identify associated social providers
 * Uses direct email lookup for optimal O(1) performance
 */
export async function checkExistingAccount(email: string): Promise<ExistingAccountInfo> {
  try {
    const supabaseAdmin = await createServiceRole()
    
    // Try direct email lookup first (most efficient)
    let existingUser: SupabaseUser | null = null
    let lookupError: any = null
    
    // Type guard to check if getUserByEmail method exists
    function hasGetUserByEmail(adminAuth: any): adminAuth is { getUserByEmail: (email: string) => Promise<{ data: { user: SupabaseUser } | null, error: any }> } {
      return adminAuth && typeof adminAuth.getUserByEmail === 'function'
    }
    
    // Attempt direct getUserByEmail if available (with proper type checking)
    try {
      const adminAuth = supabaseAdmin.auth.admin
      if (hasGetUserByEmail(adminAuth)) {
        const { data: userData, error: userError } = await adminAuth.getUserByEmail(email)
        if (userError) {
          lookupError = userError
        } else if (userData?.user) {
          existingUser = userData.user as SupabaseUser
        }
      } else {
        // Method doesn't exist, set error to trigger fallback
        lookupError = new Error('getUserByEmail method not available')
      }
    } catch (directLookupError) {
      // Method call failed, fall back to database query
      lookupError = directLookupError
    }
    
    // If direct lookup failed or method doesn't exist, use database query
    if (!existingUser && lookupError) {
      try {
        // Direct database query on auth.users table (much more efficient than listUsers)
        const { data: dbUsers, error: dbError } = await supabaseAdmin
          .from('auth.users')
          .select('id, email, user_metadata, app_metadata, email_confirmed_at, created_at, identities')
          .eq('email', email)
          .limit(1)
        
        if (dbError) {
          // If direct DB query fails, fall back to paginated listUsers as last resort
          console.warn('⚠️ [AUTH HELPERS] Falling back to listUsers due to database query failure. This may indicate a configuration issue.', {
            email,
            dbError: dbError.message,
            timestamp: new Date().toISOString()
          })
          
          // Implement pagination to check all users until found or all pages exhausted
          let currentPage = 1
          const perPage = 50
          let foundUser: SupabaseUser | null = null
          
          while (!foundUser) {
            const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
              page: currentPage,
              perPage
            })
            
            if (authError) {
              console.error('⚠️ [AUTH HELPERS] Error during paginated user lookup:', authError)
              return {
                exists: false,
                providers: [],
                error: {
                  type: 'SUPABASE_ERROR',
                  message: 'Failed to lookup user by email during pagination',
                  details: authError
                }
              }
            }
            
            // Check if user exists in current page
            foundUser = authUsers.users.find(user => user.email === email) as SupabaseUser || null
            
            // If user found, break out of loop
            if (foundUser) {
              console.log(`✅ [AUTH HELPERS] User found on page ${currentPage} of ${Math.ceil(authUsers.total / perPage)}`)
              break
            }
            
            // If we've reached the last page and no user found, break
            if (authUsers.users.length < perPage || currentPage * perPage >= authUsers.total) {
              console.log(`🔍 [AUTH HELPERS] User not found after checking ${currentPage} pages (${authUsers.total} total users)`)
              break
            }
            
            currentPage++
            
            // Safety limit to prevent infinite loops (max 100 pages = 5000 users)
            if (currentPage > 100) {
              console.warn('⚠️ [AUTH HELPERS] Pagination safety limit reached (100 pages). Stopping search.')
              break
            }
          }
          
          existingUser = foundUser
        } else if (dbUsers && dbUsers.length > 0) {
          existingUser = dbUsers[0] as SupabaseUser
        }
      } catch (fallbackError) {
        return {
          exists: false,
          providers: [],
          error: {
            type: 'UNKNOWN_ERROR',
            message: 'All user lookup methods failed',
            details: fallbackError
          }
        }
      }
    }
    
    if (!existingUser) {
      return { exists: false, providers: [] }
    }
    
    // Determine providers from user data
    let providers: string[] = []
    
    // Try to get providers from admin API identities first
    const adminIdentities = existingUser.identities || []
    if (adminIdentities.length > 0) {
      providers = adminIdentities.map((identity: UserIdentity) => identity.provider)
    } else if ((existingUser.app_metadata as UserMetadata)?.providers?.length) {
      // Fallback to app_metadata if available
      providers = (existingUser.app_metadata as UserMetadata).providers!
    } else {
      // Enhanced provider detection with specific social provider patterns
      providers = detectProvidersFromUserData(existingUser)
    }
    
    return {
      exists: true,
      providers: providers.length > 0 ? providers : ['email'],
      userId: existingUser.id
    }
    
  } catch (error) {
    console.error('Error checking existing account:', error)
    
    // Determine error type for better error handling
    let errorType: 'SUPABASE_ERROR' | 'NETWORK_ERROR' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR' = 'UNKNOWN_ERROR'
    let errorMessage = 'An unexpected error occurred while checking account'
    
    if (error && typeof error === 'object') {
      const err = error as any
      if (err.code === 'PGRST116' || err.code === 'PGRST301') {
        errorType = 'PERMISSION_ERROR'
        errorMessage = 'Insufficient permissions to access user data'
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorType = 'NETWORK_ERROR'
        errorMessage = 'Network error while accessing user data'
      } else if (err.message?.includes('supabase') || err.code) {
        errorType = 'SUPABASE_ERROR'
        errorMessage = 'Supabase service error while checking account'
      }
    }
    
    return {
      exists: false,
      providers: [],
      error: {
        type: errorType,
        message: errorMessage,
        details: error
      }
    }
  }
}

/**
 * Get a user-friendly provider name for display
 */
export function getProviderDisplayName(provider: string): string {
  switch (provider) {
    case 'google':
      return 'Google'
    case 'facebook':
      return 'Facebook'
    case 'twitter':
      return 'X (Twitter)'
    case 'github':
      return 'GitHub'
    case 'linkedin':
      return 'LinkedIn'
    case 'email':
      return 'Email/Password'
    case 'unknown':
      return 'a social login provider'
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1)
  }
}

/**
 * Generate an appropriate error message for existing social login accounts
 */
export function generateSocialLoginErrorMessage(providers: string[]): string {
  // Filter out email provider for social login messages
  const socialProviders = providers.filter(provider => provider !== 'email')
  
  if (socialProviders.length === 0) {
    return "An account with this email already exists. Please try logging in with your password instead."
  }
  
  // Handle unknown provider case with generic messaging
  if (socialProviders.includes('unknown')) {
    return "An account with this email already exists and appears to be linked to a social login provider. Please try logging in using the social login method you originally used to create this account, or create a new account using a different email address."
  }
  
  if (socialProviders.length === 1) {
    const providerName = getProviderDisplayName(socialProviders[0])
    return `An account with this email already exists through ${providerName}. Please use that login method instead or create a new account using a different email address.`
  } else {
    const providerNames = socialProviders.map(getProviderDisplayName)
    const lastProvider = providerNames.pop()
    const otherProviders = providerNames.join(', ')
    return `An account with this email already exists through ${otherProviders} or ${lastProvider}. Please use one of those login methods instead or create a new account using a different email address.`
  }
}
