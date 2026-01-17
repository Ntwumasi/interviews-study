/**
 * Simple in-memory rate limiter
 * For production with multiple serverless instances, consider using Upstash Redis
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Clean every minute

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in seconds */
  windowSeconds: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

/**
 * Check rate limit for a given identifier (usually userId or IP)
 * @param identifier - Unique identifier for the rate limit bucket
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = identifier

  const existing = rateLimitMap.get(key)

  // If no existing entry or window has expired, create new entry
  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: now + windowMs,
    }
  }

  // Check if limit exceeded
  if (existing.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: existing.resetTime,
    }
  }

  // Increment counter
  existing.count++
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - existing.count,
    resetTime: existing.resetTime,
  }
}

/**
 * Create rate limit headers for the response
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
  }
}

// Pre-configured rate limits for different endpoints
export const RATE_LIMITS = {
  // AI endpoints - expensive API calls
  aiInterviewer: { limit: 30, windowSeconds: 60 }, // 30 requests per minute
  feedback: { limit: 5, windowSeconds: 60 }, // 5 feedback generations per minute
  faq: { limit: 10, windowSeconds: 60 }, // 10 FAQ requests per minute
  jobRoadmap: { limit: 5, windowSeconds: 60 }, // 5 roadmap generations per minute
  textToSpeech: { limit: 30, windowSeconds: 60 }, // 30 TTS requests per minute

  // Code execution - resource intensive
  executeCode: { limit: 20, windowSeconds: 60 }, // 20 code executions per minute

  // General API endpoints
  default: { limit: 100, windowSeconds: 60 }, // 100 requests per minute
} as const
