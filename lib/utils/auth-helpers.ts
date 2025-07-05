import { createServiceRole } from '@/lib/supabase/server';

/**
 * Load provider URL patterns from environment variables or use defaults
 * @param provider The provider name
 * @param envKey The environment variable key
 * @param defaults Default URL patterns to use if environment variable is not set
 * @returns Array of URL patterns
 */
function getProviderPatterns(provider: string, envKey: string, defaults: string[]): string[] {
  const envValue = process.env[envKey];
  
  if (envValue) {
    // Split by comma and trim each value
    return envValue.split(',').map(pattern => pattern.trim()).filter(pattern => pattern.length > 0);
  }
  
  return defaults;
}

// Provider URL patterns for social login detection
// Last verified: 2023-07-05 - These patterns are used to detect social login providers
// from user metadata (avatar URLs, profile pictures, etc.)
const PROVIDER_URL_PATTERNS = {
  google: getProviderPatterns(
    'google',
    'AUTH_GOOGLE_URL_PATTERNS',
    ['googleusercontent.com', 'google.com']
  ),
  facebook: getProviderPatterns(
    'facebook',
    'AUTH_FACEBOOK_URL_PATTERNS',
    ['facebook.com', 'fbcdn.net']
  ),
  twitter: getProviderPatterns(
    'twitter',
    'AUTH_TWITTER_URL_PATTERNS',
    ['twimg.com', 'twitter.com', 'x.com']
  ),
  github: getProviderPatterns(
    'github',
    'AUTH_GITHUB_URL_PATTERNS',
    ['githubusercontent.com', 'github.com']
  ),
} as const;

// Type definitions for Supabase user identity
interface UserIdentity {
  provider: string;
  id: string;
  user_id: string;
  identity_data?: Record<string, unknown>;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Type definition for Supabase user metadata
interface UserMetadata {
  providers?: string[];
  picture?: string;
  avatar_url?: string;
  email_verified?: boolean;
  full_name?: string;
  name?: string;
  [key: string]: unknown;
}

// Type definition for complete Supabase user object
interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata: UserMetadata;
  app_metadata: Record<string, unknown>;
  email_confirmed_at?: string;
  created_at: string;
  updated_at?: string;
  identities?: UserIdentity[];
}

export interface ExistingAccountInfo {
  exists: boolean;
  providers: string[];
  userId?: string;
  error?: {
    type:
      | 'SUPABASE_ERROR'
      | 'NETWORK_ERROR'
      | 'PERMISSION_ERROR'
      | 'UNKNOWN_ERROR';
    message: string;
    details?: unknown;
  };
}

/**
 * Enhanced provider detection using specific patterns and user data analysis
 * Returns 'unknown' when provider cannot be confidently determined
 */
function detectProvidersFromUserData(user: SupabaseUser): string[] {
  const userMetadata = user.user_metadata;
  const appMetadata = user.app_metadata;

  // Check app_metadata for explicit provider information first
  if (appMetadata.provider && typeof appMetadata.provider === 'string') {
    return [appMetadata.provider];
  }

  // Check for specific social provider patterns using explicit field checks

  // Helper function to safely convert picture to string
  const getPictureUrl = (picture: unknown): string | null => {
    if (typeof picture === 'string') {
      return picture.toLowerCase();
    }
    if (picture && typeof picture === 'object' && 'toString' in picture) {
      try {
        return String(picture).toLowerCase();
      } catch {
        return null;
      }
    }
    return null;
  };

  // Check for provider-specific patterns using centralized URL patterns
  if (userMetadata.picture) {
    const pictureUrl = getPictureUrl(userMetadata.picture);
    if (pictureUrl) {
      // Iterate over provider patterns to find matches
      for (const [provider, patterns] of Object.entries(
        PROVIDER_URL_PATTERNS
      )) {
        const hasMatch = patterns.some((pattern) =>
          pictureUrl.includes(pattern)
        );
        if (hasMatch) {
          // Provider detected from picture URL pattern
          return [provider];
        }
      }
    }
  }

  // General social login indicators (more reliable checks)
  const hasSocialIndicators =
    userMetadata.picture !== undefined ||
    userMetadata.avatar_url !== undefined ||
    (userMetadata.email_verified === true &&
      user.email_confirmed_at &&
      user.created_at &&
      Math.abs(
        new Date(user.email_confirmed_at).getTime() -
          new Date(user.created_at).getTime()
      ) < 5000);

  // If we have social indicators but can't determine the specific provider
  if (hasSocialIndicators && Object.keys(userMetadata).length > 0) {
    return ['unknown']; // Use 'unknown' for indeterminate social providers
  }

  // Default to email/password if no social indicators
  return ['email'];
}

// Type guard to check if getUserByEmail method exists
function hasGetUserByEmail(
  adminAuth: any
): adminAuth is {
  getUserByEmail: (
    email: string
  ) => Promise<{ data: { user: SupabaseUser } | null; error: any }>;
} {
  return adminAuth && typeof adminAuth.getUserByEmail === 'function';
}

// Type guard to safely check if an object matches the SupabaseUser structure
function isSupabaseUser(obj: any): obj is SupabaseUser {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      (!obj.email || typeof obj.email === 'string') &&
      obj.user_metadata &&
      typeof obj.user_metadata === 'object' &&
      obj.app_metadata &&
      typeof obj.app_metadata === 'object' &&
      typeof obj.created_at === 'string'
  );
}

/**
 * Try to get a user by email using the direct getUserByEmail API
 * Most efficient lookup method with O(1) complexity
 */
async function tryGetUserByEmail(
  supabaseAdmin: any,
  email: string
): Promise<{ user: SupabaseUser | null; error: any }> {
  try {
    const adminAuth = supabaseAdmin.auth.admin;
    if (!hasGetUserByEmail(adminAuth)) {
      return {
        user: null,
        error: new Error('getUserByEmail method not available'),
      };
    }

    const { data: userData, error: userError } =
      await adminAuth.getUserByEmail(email);
    if (userError) {
      return { user: null, error: userError };
    }

    if (userData?.user && isSupabaseUser(userData.user)) {
      return { user: userData.user, error: null };
    } else if (userData?.user) {
      console.warn(
        'User from getUserByEmail does not match SupabaseUser structure',
        userData.user
      );
      return {
        user: null,
        error: new Error('Invalid user structure returned'),
      };
    }
    return { user: null, error: null };
  } catch (directLookupError) {
    return { user: null, error: directLookupError };
  }
}

/**
 * Try to get a user by email using direct database query
 * Falls back when getUserByEmail API is not available
 */
async function tryGetUserFromDatabase(
  supabaseAdmin: any,
  email: string
): Promise<{ user: SupabaseUser | null; error: any }> {
  try {
    // Direct database query on auth.users table (more efficient than listUsers)
    const { data: dbUsers, error: dbError } = await supabaseAdmin
      .from('auth.users')
      .select(
        'id, email, user_metadata, app_metadata, email_confirmed_at, created_at, identities'
      )
      .eq('email', email)
      .limit(1);

    if (dbError) {
      return { user: null, error: dbError };
    }

    if (dbUsers && dbUsers.length > 0 && isSupabaseUser(dbUsers[0])) {
      return { user: dbUsers[0], error: null };
    } else if (dbUsers && dbUsers.length > 0) {
      console.warn(
        'User from SQL query does not match SupabaseUser structure',
        dbUsers[0]
      );
      return {
        user: null,
        error: new Error('Invalid user structure returned'),
      };
    }

    return { user: null, error: null };
  } catch (dbQueryError) {
    return { user: null, error: dbQueryError };
  }
}

/**
 * Try to get a user by email using paginated listUsers API
 * Last resort fallback with O(n) complexity
 * Enhanced with performance monitoring and configurable limits
 *
 * PERFORMANCE WARNING: This approach is inefficient (O(n) complexity) and should be replaced with one of the following options:
 * 1. Add a database index on auth.users.email column to improve direct query performance
 * 2. Create a dedicated user search API endpoint with proper indexing
 * 3. Implement Redis-based caching for frequently looked up emails
 * 4. Consider integrating a search service like Elasticsearch for large user bases
 *
 * The current implementation has mitigations (rate limiting, metrics) but remains a potential
 * performance bottleneck and should be optimized for production use.
 */
import { checkRateLimit } from './redis-client';
import { incrementCounter, recordHistogram } from './metrics';

async function tryGetUserPaginated(
  supabaseAdmin: any,
  email: string
): Promise<{ user: SupabaseUser | null; error: any }> {
  // --- Rate limiting (5 attempts / 5 minutes) ------------------------------
  const RATE_LIMIT_ATTEMPTS = 5;
  const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  const key = `pagination:${email.toLowerCase()}`;

  const rateLimitResult = await checkRateLimit(
    key,
    RATE_LIMIT_ATTEMPTS,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rateLimitResult.allowed) {
    return {
      user: null,
      error: rateLimitResult.error,
    };
  }
  const startTime = Date.now();
  
  // Validate and bound pagination environment variables
  const DEFAULT_MAX_PAGES = 10;
  const DEFAULT_PAGE_SIZE = 50;
  const MIN_PAGE_SIZE = 1;
  const MAX_PAGE_SIZE = 100; // Reasonable upper bound for pagination
  const MIN_MAX_PAGES = 1;
  const MAX_MAX_PAGES = 20;  // Prevent excessive pagination
  
  // Parse and validate maxPages with bounds
  let maxPages = parseInt(process.env.AUTH_PAGINATION_MAX_PAGES || `${DEFAULT_MAX_PAGES}`, 10);
  if (isNaN(maxPages) || maxPages < MIN_MAX_PAGES || maxPages > MAX_MAX_PAGES) {
    console.warn(`⚠️ [AUTH HELPERS] Invalid AUTH_PAGINATION_MAX_PAGES value: ${process.env.AUTH_PAGINATION_MAX_PAGES}, using default: ${DEFAULT_MAX_PAGES}`);
    maxPages = DEFAULT_MAX_PAGES;
  }
  
  // Parse and validate pageSize with bounds
  let pageSize = parseInt(process.env.AUTH_PAGINATION_PAGE_SIZE || `${DEFAULT_PAGE_SIZE}`, 10);
  if (isNaN(pageSize) || pageSize < MIN_PAGE_SIZE || pageSize > MAX_PAGE_SIZE) {
    console.warn(`⚠️ [AUTH HELPERS] Invalid AUTH_PAGINATION_PAGE_SIZE value: ${process.env.AUTH_PAGINATION_PAGE_SIZE}, using default: ${DEFAULT_PAGE_SIZE}`);
    pageSize = DEFAULT_PAGE_SIZE;
  }

  try {
    console.warn(
      '⚠️ [AUTH HELPERS] Falling back to listUsers pagination for email lookup. This is inefficient.',
      {
        email: email.substring(0, 3) + '***', // Partial email for privacy
        maxPages,
        pageSize,
        timestamp: new Date().toISOString(),
        performance:
          'DEGRADED - Consider database indexing on auth.users.email',
      }
    );

    // Track pagination fallback frequency
    incrementCounter('auth.pagination_fallback');

    let currentPage = 1;
    let totalUsersScanned = 0;

    while (true) {
      const pageStartTime = Date.now();

      const { data: authUsers, error: authError } =
        await supabaseAdmin.auth.admin.listUsers({
          page: currentPage,
          perPage: pageSize,
        });

      const pageEndTime = Date.now();
      const pageLatency = pageEndTime - pageStartTime;

      if (authError) {
        console.error('❌ [AUTH HELPERS] Error querying users via listUsers', {
          email: email.substring(0, 3) + '***',
          page: currentPage,
          authError: authError.message,
          totalLatency: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
        incrementCounter('auth.pagination_lookup.error');
        return { user: null, error: authError };
      }

      if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
        console.log(
          'ℹ️ [AUTH HELPERS] No users found or empty response from listUsers',
          {
            page: currentPage,
            totalLatency: Date.now() - startTime,
          }
        );
        return { user: null, error: null };
      }

      totalUsersScanned += authUsers.users.length;

      // Performance warning for slow pages
      if (pageLatency > 1000) {
        console.warn('🐌 [AUTH HELPERS] Slow pagination query detected', {
          page: currentPage,
          pageLatency,
          usersInPage: authUsers.users.length,
          recommendation:
            'Consider implementing database indexes or user search optimization',
        });
      }

      // Check if user exists in current page
      const potentialUser =
        authUsers.users.find(
          (user: { email?: string }) => user.email === email
        ) || null;

      // Validate that the found user matches the expected structure
      if (potentialUser && isSupabaseUser(potentialUser)) {
        const totalLatency = Date.now() - startTime;

        // Record successful lookup metrics
        recordHistogram('auth.pagination_lookup.success_latency', totalLatency);
        incrementCounter('auth.pagination_lookup.success');

        console.log(`✅ [AUTH HELPERS] User found via pagination`, {
          page: currentPage,
          totalPages: Math.ceil(authUsers.total / pageSize),
          usersScanned: totalUsersScanned,
          totalLatency,
          efficiency: `${((totalUsersScanned / authUsers.total) * 100).toFixed(1)}% of users scanned`,
          timestamp: new Date().toISOString(),
        });
        return { user: potentialUser, error: null };
      } else if (potentialUser) {
        console.warn(
          'User from listUsers does not match SupabaseUser structure',
          {
            page: currentPage,
            userStructure: Object.keys(potentialUser || {}),
          }
        );

        // Track structure mismatch errors
        incrementCounter('auth.pagination_lookup.structure_mismatch');
        return {
          user: null,
          error: new Error('Invalid user structure returned from listUsers'),
        };
      }

      // If we've reached the last page and no user found, break
      if (
        authUsers.users.length < pageSize ||
        currentPage * pageSize >= authUsers.total
      ) {
        const totalLatency = Date.now() - startTime;

        // Record not found metrics
        recordHistogram(
          'auth.pagination_lookup.not_found_latency',
          totalLatency
        );
        incrementCounter('auth.pagination_lookup.not_found');

        console.log(
          `🔍 [AUTH HELPERS] User not found after complete pagination`,
          {
            pagesChecked: currentPage,
            totalUsers: authUsers.total,
            usersScanned: totalUsersScanned,
            totalLatency,
            recommendation:
              'User does not exist or consider implementing auth.users email index',
          }
        );
        break;
      }

      currentPage++;

      // Configurable safety check to prevent infinite loops
      if (currentPage > maxPages) {
        const totalLatency = Date.now() - startTime;

        // Record max pages exceeded metrics
        recordHistogram(
          'auth.pagination_lookup.max_pages_exceeded_latency',
          totalLatency
        );
        incrementCounter('auth.pagination_lookup.max_pages_exceeded');

        console.warn(
          '⚠️ [AUTH HELPERS] Exceeded maximum page limit for email lookup',
          {
            maxPages,
            usersScanned: totalUsersScanned,
            totalLatency,
            recommendation:
              'Increase AUTH_PAGINATION_MAX_PAGES env var or implement database optimization',
          }
        );
        break;
      }
    }

    return { user: null, error: null };
  } catch (paginationError) {
    const totalLatency = Date.now() - startTime;
    console.error('💥 [AUTH HELPERS] Pagination lookup failed with exception', {
      email: email.substring(0, 3) + '***',
      totalLatency,
      error:
        paginationError instanceof Error
          ? paginationError.message
          : String(paginationError),
    });
    return { user: null, error: paginationError };
  }
}

/**
 * Extract provider information from a user object
 * Analyzes user metadata to determine login methods (email/password or social)
 */
function extractUserProviders(user: SupabaseUser): string[] {
  return detectProvidersFromUserData(user);
}

/**
 * Check if an account exists for the given email and identify associated social providers
 * Uses a cascading lookup strategy with multiple fallback mechanisms for robustness
 */
export async function checkExistingAccount(
  email: string
): Promise<ExistingAccountInfo> {
  try {
    const supabaseAdmin = await createServiceRole();

    // 1. Try direct email lookup first (most efficient O(1) operation)
    const { user: directUser, error: directError } = await tryGetUserByEmail(
      supabaseAdmin,
      email
    );

    if (directUser) {
      const providers = extractUserProviders(directUser);
      return {
        exists: true,
        providers,
        userId: directUser.id,
      };
    }

    // 2. If direct lookup failed, try database query
    if (directError) {
      const { user: dbUser, error: dbError } = await tryGetUserFromDatabase(
        supabaseAdmin,
        email
      );

      if (dbUser) {
        const providers = extractUserProviders(dbUser);
        return {
          exists: true,
          providers,
          userId: dbUser.id,
        };
      }

      // 3. If database query failed, try paginated search as last resort
      if (dbError) {
        const { user: paginatedUser, error: paginationError } =
          await tryGetUserPaginated(supabaseAdmin, email);

        if (paginatedUser) {
          const providers = extractUserProviders(paginatedUser);
          return {
            exists: true,
            providers,
            userId: paginatedUser.id,
          };
        }

        if (paginationError) {
          return {
            exists: false,
            providers: [],
            error: {
              type: 'UNKNOWN_ERROR',
              message: `Failed after all lookup attempts: ${paginationError instanceof Error ? paginationError.message : String(paginationError)}`,
              details: paginationError,
            },
          };
        }
      }
    }

    // User not found through any method
    return {
      exists: false,
      userId: undefined,
      providers: [],
    };
  } catch (error) {
    // Determine error type for better error handling
    let errorType:
      | 'SUPABASE_ERROR'
      | 'NETWORK_ERROR'
      | 'PERMISSION_ERROR'
      | 'UNKNOWN_ERROR' = 'UNKNOWN_ERROR';
    let errorMessage = 'An unexpected error occurred while checking account';

    if (error && typeof error === 'object') {
      const err = error as any;
      if (err.code === 'PGRST116' || err.code === 'PGRST301') {
        errorType = 'PERMISSION_ERROR';
        errorMessage = 'Insufficient permissions to access user data';
      } else if (
        err.message?.includes('network') ||
        err.message?.includes('fetch')
      ) {
        errorType = 'NETWORK_ERROR';
        errorMessage = 'Network error while accessing user data';
      } else if (err.message?.includes('supabase') || err.code) {
        errorType = 'SUPABASE_ERROR';
        errorMessage = 'Supabase service error while checking account';
      }
    }

    return {
      exists: false,
      providers: [],
      error: {
        type: errorType,
        message: errorMessage,
        details: error,
      },
    };
  }
}

/**
 * Get a user-friendly provider name for display
 */
export function getProviderDisplayName(provider: string): string {
  switch (provider) {
    case 'google':
      return 'Google';
    case 'facebook':
      return 'Facebook';
    case 'twitter':
      return 'X (Twitter)';
    case 'github':
      return 'GitHub';
    case 'linkedin':
      return 'LinkedIn';
    case 'email':
      return 'Email/Password';
    case 'unknown':
      return 'a social login provider';
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}

/**
 * Generate an appropriate error message for existing social login accounts
 */
export function generateSocialLoginErrorMessage(providers: string[]): string {
  // Filter out email provider for social login messages
  const socialProviders = providers.filter((provider) => provider !== 'email');

  if (socialProviders.length === 0) {
    return 'An account with this email already exists. Please try logging in with your password instead.';
  }

  // Handle unknown provider case with generic messaging
  if (socialProviders.includes('unknown')) {
    return 'An account with this email already exists and appears to be linked to a social login provider. Please try logging in using the social login method you originally used to create this account, or create a new account using a different email address.';
  }

  if (socialProviders.length === 1) {
    const providerName = getProviderDisplayName(socialProviders[0]);
    return `An account with this email already exists through ${providerName}. Please use that login method instead or create a new account using a different email address.`;
  } else {
    const providerNames = socialProviders.map(getProviderDisplayName);
    const lastProvider = providerNames.pop();
    const otherProviders = providerNames.join(', ');
    return `An account with this email already exists through ${otherProviders} or ${lastProvider}. Please use one of those login methods instead or create a new account using a different email address.`;
  }
}
