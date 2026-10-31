/**
 * In-memory sliding-window rate limiter for LinkForge.
 * Simple, zero-dependency, self-contained. Prunes expired records periodically.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, record] of store.entries()) {
    // Keep records with entries from the last 15 minutes
    const valid = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      record.timestamps = valid;
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowSeconds: number = 60
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = store.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    store.set(identifier, record);
  }

  // Filter out timestamps outside the active window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    resetSeconds: windowSeconds,
  };
}
