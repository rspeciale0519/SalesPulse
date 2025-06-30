/**
 * Simple in-memory rate limiter for authentication attempts
 * In production, consider using Redis or a database for distributed rate limiting
 */

interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  lastAttempt: number
  blockedUntil?: number
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>()
  private readonly maxAttempts: number
  private readonly windowMs: number
  private readonly blockDurationMs: number

  constructor(
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    blockDurationMs: number = 30 * 60 * 1000 // 30 minutes
  ) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.blockDurationMs = blockDurationMs
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (e.g., IP address, email)
   * @returns Object with isBlocked status and remaining attempts
   */
  check(identifier: string): { isBlocked: boolean; remainingAttempts: number; resetTime?: number } {
    const now = Date.now()
    const entry = this.storage.get(identifier)

    if (!entry) {
      return { isBlocked: false, remainingAttempts: this.maxAttempts }
    }

    // Check if user is currently blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return { 
        isBlocked: true, 
        remainingAttempts: 0, 
        resetTime: entry.blockedUntil 
      }
    }

    // Check if the window has expired
    if (now - entry.firstAttempt > this.windowMs) {
      // Reset the entry
      this.storage.delete(identifier)
      return { isBlocked: false, remainingAttempts: this.maxAttempts }
    }

    // Calculate remaining attempts
    const remainingAttempts = Math.max(0, this.maxAttempts - entry.attempts)
    
    return { 
      isBlocked: false, 
      remainingAttempts,
      resetTime: entry.firstAttempt + this.windowMs
    }
  }

  /**
   * Record a failed attempt
   * @param identifier - Unique identifier (e.g., IP address, email)
   * @returns Updated rate limit status
   */
  recordAttempt(identifier: string): { isBlocked: boolean; remainingAttempts: number; resetTime?: number } {
    const now = Date.now()
    const entry = this.storage.get(identifier)

    if (!entry) {
      // First attempt
      this.storage.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      })
      return { isBlocked: false, remainingAttempts: this.maxAttempts - 1 }
    }

    // Check if the window has expired
    if (now - entry.firstAttempt > this.windowMs) {
      // Reset and record new attempt
      this.storage.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      })
      return { isBlocked: false, remainingAttempts: this.maxAttempts - 1 }
    }

    // Increment attempts
    entry.attempts++
    entry.lastAttempt = now

    // Check if we should block
    if (entry.attempts >= this.maxAttempts) {
      entry.blockedUntil = now + this.blockDurationMs
      this.storage.set(identifier, entry)
      return { 
        isBlocked: true, 
        remainingAttempts: 0, 
        resetTime: entry.blockedUntil 
      }
    }

    this.storage.set(identifier, entry)
    return { 
      isBlocked: false, 
      remainingAttempts: this.maxAttempts - entry.attempts,
      resetTime: entry.firstAttempt + this.windowMs
    }
  }

  /**
   * Clear rate limit for an identifier (e.g., after successful login)
   * @param identifier - Unique identifier
   */
  reset(identifier: string): void {
    this.storage.delete(identifier)
  }

  /**
   * Clean up expired entries (should be called periodically)
   */
  cleanup(): void {
    const now = Date.now()
    for (const [identifier, entry] of this.storage.entries()) {
      // Remove entries that are past their window and not blocked
      if (now - entry.firstAttempt > this.windowMs && (!entry.blockedUntil || now > entry.blockedUntil)) {
        this.storage.delete(identifier)
      }
    }
  }
}

// Create singleton instance
export const authRateLimiter = new RateLimiter(
  5, // Max 5 attempts
  15 * 60 * 1000, // Within 15 minutes
  30 * 60 * 1000 // Block for 30 minutes
)

// Utility function to get client identifier
export function getClientIdentifier(req?: Request): string {
  if (typeof window !== 'undefined') {
    // Client-side: use a combination of user agent and a session-based identifier
    return `client-${navigator.userAgent.slice(0, 50)}-${window.location.host}`
  }
  
  // Server-side: use IP address or forwarded IP
  if (req) {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
    return `ip-${ip}`
  }
  
  return 'unknown'
}
