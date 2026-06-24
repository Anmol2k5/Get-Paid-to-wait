/**
 * In-memory sliding-window rate limiter.
 * Resets on deploy (serverless cold start). Good enough for basic protection.
 */

interface WindowEntry {
  timestamps: number[];
}

const store = new Map<string, WindowEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * Check if a request should be rate-limited.
 * Returns { allowed: boolean, remaining: number, resetMs: number }
 */
export function checkRateLimit(
  key: string,
  maxPerWindow: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  cleanup(windowMs);

  const cutoff = now - windowMs;
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxPerWindow) {
    const oldestInWindow = entry.timestamps[0];
    const resetMs = oldestInWindow + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxPerWindow - entry.timestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Get the current count for a key within the window.
 */
export function getRateLimitCount(key: string, windowMs: number): number {
  const entry = store.get(key);
  if (!entry) return 0;
  const cutoff = Date.now() - windowMs;
  return entry.timestamps.filter((t) => t > cutoff).length;
}
