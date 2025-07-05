import { createClient, RedisClientType } from 'redis'

// Redis client for distributed rate limiting and caching
let redisClient: RedisClientType | null = null

export async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL
    
    if (!redisUrl) {
      console.warn('⚠️ [REDIS] REDIS_URL not configured, rate limiting will fall back to in-memory')
      return null
    }
    
    try {
      redisClient = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000
          // Removed lazyConnect option since we're connecting immediately below
        }
      })
      
      redisClient.on('error', (err: Error) => {
        console.error('❌ [REDIS] Client error:', err)
      })
      
      await redisClient.connect()
      console.log('✅ [REDIS] Connected successfully')
    } catch (error) {
      console.error('❌ [REDIS] Failed to connect:', error)
      redisClient = null
      return null
    }
  }
  
  return redisClient
}

export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 5 * 60 * 1000
): Promise<{ allowed: boolean; error?: Error }> {
  const client = await getRedisClient()
  
  if (!client) {
    // Fallback to in-memory rate limiting
    return checkInMemoryRateLimit(key, maxAttempts, windowMs)
  }
  
  try {
    const redisKey = `rate_limit:${key}`
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Remove old entries and get current count
    await client.zRemRangeByScore(redisKey, '-inf', windowStart)
    const currentCount = await client.zCard(redisKey)
    
    if (currentCount >= maxAttempts) {
      return { allowed: false, error: new Error('RATE_LIMIT_EXCEEDED: Too many lookup attempts, please retry later') }
    }
    
    // Add current attempt
    await client.zAdd(redisKey, { score: now, value: now.toString() })
    
    // Set expiration for cleanup
    await client.expire(redisKey, Math.ceil(windowMs / 1000))
    
    return { allowed: true }
  } catch (error) {
    console.error('❌ [REDIS] Rate limit check failed:', error)
    // Fallback to in-memory on Redis failure
    return checkInMemoryRateLimit(key, maxAttempts, windowMs)
  }
}

// Fallback in-memory rate limiter
const _inMemoryRateLimiter: Map<string, { count: number; first: number }> =
  (global as any)._inMemoryRateLimiter || new Map()
;(global as any)._inMemoryRateLimiter = _inMemoryRateLimiter

// Configuration for in-memory rate limiter
const MAX_ENTRIES = 10000 // Maximum number of entries to prevent memory bloat

/**
 * Cleanup function to prevent unbounded growth of the in-memory rate limiter
 * Removes expired entries and, if still over threshold, removes oldest entries
 */
function cleanupRateLimiterMap(windowMs: number) {
  try {
    const now = Date.now()
    let removed = 0
    
    // First pass: Remove expired entries
    for (const [key, data] of _inMemoryRateLimiter.entries()) {
      if (now - data.first > windowMs) {
        _inMemoryRateLimiter.delete(key)
        removed++
      }
    }
    
    // If still too many entries, remove oldest ones
    if (_inMemoryRateLimiter.size >= MAX_ENTRIES) {
      // Convert to array for sorting by timestamp
      const entries = Array.from(_inMemoryRateLimiter.entries())
        .sort((a, b) => a[1].first - b[1].first)
      
      // Remove oldest entries until under the limit
      const toRemove = _inMemoryRateLimiter.size - MAX_ENTRIES
      for (let i = 0; i < toRemove; i++) {
        if (entries[i]) {
          _inMemoryRateLimiter.delete(entries[i][0])
          removed++
        }
      }
    }
    
    if (removed > 0 && process.env.NODE_ENV === 'development') {
      console.log(`🧹 [RATE LIMITER] Cleaned up ${removed} entries, size: ${_inMemoryRateLimiter.size}`)
    }
  } catch (err) {
    console.error('❌ [RATE LIMITER] Error during cleanup:', err)
  }
}

function checkInMemoryRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; error?: Error } {
  const now = Date.now()
  
  // Trigger cleanup if Map size exceeds or equals threshold
  if (_inMemoryRateLimiter.size >= MAX_ENTRIES) {
    cleanupRateLimiterMap(windowMs)
  }
  
  const bucket = _inMemoryRateLimiter.get(key)
  
  if (bucket) {
    // Reset window if expired
    if (now - bucket.first > windowMs) {
      _inMemoryRateLimiter.set(key, { count: 1, first: now })
      return { allowed: true }
    } else if (bucket.count >= maxAttempts) {
      return { allowed: false, error: new Error('RATE_LIMIT_EXCEEDED: Too many lookup attempts, please retry later') }
    } else {
      bucket.count += 1
      return { allowed: true }
    }
  } else {
    _inMemoryRateLimiter.set(key, { count: 1, first: now })
    return { allowed: true }
  }
}
