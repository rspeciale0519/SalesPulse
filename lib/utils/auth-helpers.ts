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

// Type guard to check if getUserByEmail method exists
function hasGetUserByEmail(adminAuth: any): adminAuth is { getUserByEmail: (email: string) => Promise<{ data: { user: SupabaseUser } | null, error: any }> } {
  return adminAuth && typeof adminAuth.getUserByEmail === 'function'
}

// Type guard to safely check if an object matches the SupabaseUser structure
function isSupabaseUser(obj: any): obj is SupabaseUser {
  return Boolean(
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    (!obj.email || typeof obj.email === 'string') &&
    obj.user_metadata && typeof obj.user_metadata === 'object' &&
    obj.app_metadata && typeof obj.app_metadata === 'object' &&
    typeof obj.created_at === 'string'
  )
}

/**
 * Try to get a user by email using the direct getUserByEmail API
 * Most efficient lookup method with O(1) complexity
 */
async function tryGetUserByEmail(supabaseAdmin: any, email: string): Promise<{ user: SupabaseUser | null, error: any }> {
  try {
    const adminAuth = supabaseAdmin.auth.admin
    if (!hasGetUserByEmail(adminAuth)) {
      return { user: null, error: new Error('getUserByEmail method not available') }
    }
    
    const { data: userData, error: userError } = await adminAuth.getUserByEmail(email)
    if (userError) {
      return { user: null, error: userError }
    }
    
    if (userData?.user && isSupabaseUser(userData.user)) {
      return { user: userData.user, error: null }
    } else if (userData?.user) {
      console.warn('User from getUserByEmail does not match SupabaseUser structure', userData.user)
      return { user: null, error: new Error('Invalid user structure returned') }
    }
    
    return { user: null, error: null }
  } catch (directLookupError) {
    return { user: null, error: directLookupError }
  }
}

/**
 * Try to get a user by email using direct database query
 * Falls back when getUserByEmail API is not available
 */
async function tryGetUserFromDatabase(supabaseAdmin: any, email: string): Promise<{ user: SupabaseUser | null, error: any }> {
  try {
    // Direct database query on auth.users table (more efficient than listUsers)
    const { data: dbUsers, error: dbError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email, user_metadata, app_metadata, email_confirmed_at, created_at, identities')
      .eq('email', email)
      .limit(1)
    
    if (dbError) {
      return { user: null, error: dbError }
    }
    
    if (dbUsers && dbUsers.length > 0 && isSupabaseUser(dbUsers[0])) {
      return { user: dbUsers[0], error: null }
    } else if (dbUsers && dbUsers.length > 0) {
      console.warn('User from SQL query does not match SupabaseUser structure', dbUsers[0])
      return { user: null, error: new Error('Invalid user structure returned') }
    }
    
    return { user: null, error: null }
  } catch (dbQueryError) {
    return { user: null, error: dbQueryError }
  }
}

/**
 * Try to get a user by email using paginated listUsers API
 * Last resort fallback with O(n) complexity
 */
async function tryGetUserPaginated(supabaseAdmin: any, email: string): Promise<{ user: SupabaseUser | null, error: any }> {
  try {
    console.warn('⚠️ [AUTH HELPERS] Falling back to listUsers pagination for email lookup. This is inefficient.', {
      email,
      timestamp: new Date().toISOString()
    })
    
    let currentPage = 1
    const perPage = 50
    
    while (true) {
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: currentPage,
        perPage
      })
      
      if (authError) {
        console.error('❌ [AUTH HELPERS] Error querying users via listUsers', {
          email,
          authError: authError.message,
          timestamp: new Date().toISOString()
        })
        return { user: null, error: authError }
      }
      
      if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
        console.log('ℹ️ [AUTH HELPERS] No users found or empty response from listUsers')
        return { user: null, error: null }
      }
      
      // Check if user exists in current page
      const potentialUser = authUsers.users.find((user: { email?: string }) => user.email === email) || null
      
      // Validate that the found user matches the expected structure
      if (potentialUser && isSupabaseUser(potentialUser)) {
        console.log(`✅ [AUTH HELPERS] User found on page ${currentPage} of ${Math.ceil(authUsers.total / perPage)}`)
        return { user: potentialUser, error: null }
      } else if (potentialUser) {
        console.warn('User from listUsers does not match SupabaseUser structure', potentialUser)
        return { user: null, error: new Error('Invalid user structure returned from listUsers') }
      }
      
      // If we've reached the last page and no user found, break
      if (authUsers.users.length < perPage || currentPage * perPage >= authUsers.total) {
        console.log(`🔍 [AUTH HELPERS] User not found after checking ${currentPage} pages (${authUsers.total} total users)`)
        break
      }
      
      currentPage++
      
      // Safety check to prevent infinite loops (max 10 pages = 500 users)
      if (currentPage > 10) {
        console.warn('⚠️ [AUTH HELPERS] Exceeded maximum page limit (500 users) for email lookup')
        break
      }
    }
    
    return { user: null, error: null }
  } catch (paginationError) {
    return { user: null, error: paginationError }
  }
}

/**
 * Extract provider information from a user object
 * Analyzes user metadata to determine login methods (email/password or social)
 */
function extractUserProviders(user: SupabaseUser): string[] {
  return detectProvidersFromUserData(user)
}

/**
 * Check if an account exists for the given email and identify associated social providers
 * Uses a cascading lookup strategy with multiple fallback mechanisms for robustness
 */
export async function checkExistingAccount(email: string): Promise<ExistingAccountInfo> {
  try {
    const supabaseAdmin = await createServiceRole()
    
    // 1. Try direct email lookup first (most efficient O(1) operation)
    const { user: directUser, error: directError } = await tryGetUserByEmail(supabaseAdmin, email)
    
    if (directUser) {
      const providers = extractUserProviders(directUser)
      return {
        exists: true,
        providers,
        userId: directUser.id
      }
    }
    
    // 2. If direct lookup failed, try database query
    if (directError) {
      const { user: dbUser, error: dbError } = await tryGetUserFromDatabase(supabaseAdmin, email)
      
      if (dbUser) {
        const providers = extractUserProviders(dbUser)
        return {
          exists: true,
          providers,
          userId: dbUser.id
        }
      }
      
      // 3. If database query failed, try paginated search as last resort
      if (dbError) {
        const { user: paginatedUser, error: paginationError } = await tryGetUserPaginated(supabaseAdmin, email)
        
        if (paginatedUser) {
          const providers = extractUserProviders(paginatedUser)
          return {
            exists: true,
            providers,
            userId: paginatedUser.id
          }
        }
        
        if (paginationError) {
          return {
            exists: false,
            error: {
              type: 'UNKNOWN_ERROR',
              message: `Failed after all lookup attempts: ${paginationError instanceof Error ? paginationError.message : String(paginationError)}`,
              details: paginationError
            },
            userId: '',
            providers: []
          }
        }
      }
    }
    
    // User not found through any method
    return {
      exists: false,
      userId: '',
      providers: []
    }
    
  } catch (error) {
    // Determine error type for better error handling
    let errorType: 'SUPABASE_ERROR' | 'NETWORK_ERROR' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR' = 'UNKNOWN_ERROR';
    let errorMessage = 'An unexpected error occurred while checking account';
    
    if (error && typeof error === 'object') {
      const err = error as any;
      if (err.code === 'PGRST116' || err.code === 'PGRST301') {
        errorType = 'PERMISSION_ERROR';
        errorMessage = 'Insufficient permissions to access user data';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorType = 'NETWORK_ERROR';
        errorMessage = 'Network error while accessing user data';
      } else if (err.message?.includes('supabase') || err.code) {
        errorType = 'SUPABASE_ERROR';
        errorMessage = 'Supabase service error while checking account';
      }
    }
    
    return {
      exists: false,
      userId: '',
      providers: [],
      error: {
        type: errorType,
        message: errorMessage,
        details: error
      }
    };
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
