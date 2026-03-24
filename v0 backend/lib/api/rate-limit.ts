type RateEntry = {
  count: number
  resetAt: number
}

const store = new Map<string, RateEntry>()

export function checkRateLimit(
  key: string,
  maxRequests = 60,
  windowMs = 60_000,
) {
  const now = Date.now()
  const current = store.get(key)

  if (!current || now > current.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: current.resetAt - now,
    }
  }

  current.count += 1
  store.set(key, current)
  return { allowed: true, remaining: maxRequests - current.count }
}
