interface RateLimitResult {
  success: boolean;
  remaining: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs = 60 * 1000; // 1 minute window

  private constructor() {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), this.windowMs);
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  async checkLimit(key: string, maxRequests: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || entry.resetTime <= now) {
      // First request or expired entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { success: true, remaining: maxRequests - 1 };
    }

    if (entry.count >= maxRequests) {
      return { success: false, remaining: 0 };
    }

    entry.count++;
    return { success: true, remaining: maxRequests - entry.count };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetTime <= now) {
        this.limits.delete(key);
      }
    }
  }
}

export async function rateLimit(
  req: Request,
  endpoint: string,
  maxRequests: number
): Promise<RateLimitResult> {
  const limiter = RateLimiter.getInstance();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const key = `${endpoint}:${ip}`;
  return limiter.checkLimit(key, maxRequests);
}
