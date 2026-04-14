export class RateLimiter {
  constructor({ windowMs, maxRequests }) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.store = new Map();
  }

  consume(key) {
    const now = Date.now();
    const current = this.store.get(key);

    if (!current || now - current.windowStart > this.windowMs) {
      this.store.set(key, { windowStart: now, hits: 1 });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }

    current.hits += 1;
    this.store.set(key, current);

    return {
      allowed: current.hits <= this.maxRequests,
      remaining: Math.max(this.maxRequests - current.hits, 0),
      retryAfterSeconds: Math.ceil((this.windowMs - (now - current.windowStart)) / 1000),
    };
  }
}
