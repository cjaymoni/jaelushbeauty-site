/**
 * Rate limiting for the order form.
 *
 * - `createRateLimiter` keeps counts in memory. On serverless hosts each
 *   instance has its own memory, so on its own the limit is per instance.
 * - `createUpstashRateLimiter` keeps counts in Upstash Redis, shared by every
 *   instance. It is used when UPSTASH_REDIS_REST_URL and
 *   UPSTASH_REDIS_REST_TOKEN are set.
 * - `withFallback` uses the shared store and drops back to memory if it is
 *   unreachable, so an outage never blocks real orders.
 */
export type RateLimitResult = { allowed: boolean; retryAfterMs: number };

export type RateLimiter = {
  /** Records an attempt for `key` and says whether it is allowed. */
  attempt: (key: string, now: number) => RateLimitResult;
};

export type SharedRateLimiter = {
  attempt: (key: string, now: number) => Promise<RateLimitResult>;
};

/** In-memory sliding window. */
export type RateLimitOptions = {
  /** Attempts allowed per window. */
  limit: number;
  windowMs: number;
  /** Most keys kept; the oldest are dropped first so memory stays bounded. */
  maxKeys: number;
};

export function createRateLimiter({ limit, windowMs, maxKeys }: RateLimitOptions): RateLimiter {
  if (limit < 1 || windowMs <= 0 || maxKeys < 1) {
    throw new RangeError(`createRateLimiter: invalid options ${JSON.stringify({ limit, windowMs, maxKeys })}`);
  }
  // Map keeps insertion order, so the first key is the least recently used.
  const hits = new Map<string, number[]>();

  return {
    attempt(key, now) {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      hits.delete(key);

      if (recent.length >= limit) {
        hits.set(key, recent);
        return { allowed: false, retryAfterMs: windowMs - (now - recent[0]) };
      }

      recent.push(now);
      hits.set(key, recent);
      while (hits.size > maxKeys) hits.delete(hits.keys().next().value!);
      return { allowed: true, retryAfterMs: 0 };
    },
  };
}

/** The client's IP from proxy headers, or "unknown" so the limiter still applies. */
export function clientIp(get: (name: string) => string | null): string {
  const forwarded = get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || get("x-real-ip")?.trim() || "unknown";
}

export type UpstashConfig = { url: string; token: string };

/** Reads Upstash settings; null when they are not set, so memory is used alone. */
export function readUpstashConfig(env: Record<string, string | undefined>): UpstashConfig | null {
  const url = env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

export type UpstashRateLimitOptions = {
  config: UpstashConfig;
  limit: number;
  windowMs: number;
  /** Namespaces keys so other uses of the same database don't clash, e.g. "orders". */
  prefix: string;
  fetchImpl?: typeof fetch;
};

/**
 * Fixed-window limiter in Upstash Redis, shared by every server instance.
 * Each window is its own key (INCR, then PEXPIRE so Redis cleans it up).
 * Throws if Upstash cannot be reached or returns an error.
 */
export function createUpstashRateLimiter({
  config,
  limit,
  windowMs,
  prefix,
  fetchImpl = fetch,
}: UpstashRateLimitOptions): SharedRateLimiter {
  if (limit < 1 || windowMs <= 0) {
    throw new RangeError(`createUpstashRateLimiter: invalid options ${JSON.stringify({ limit, windowMs })}`);
  }
  return {
    async attempt(key, now) {
      const window = Math.floor(now / windowMs);
      const redisKey = `${prefix}:${key}:${window}`;
      const res = await fetchImpl(`${config.url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["PEXPIRE", redisKey, String(windowMs)],
        ]),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Upstash rate limit request failed (${res.status}): ${detail.slice(0, 200)}`);
      }
      const body: unknown = await res.json();
      const count = Array.isArray(body) ? (body[0] as { result?: unknown; error?: unknown } | undefined) : undefined;
      if (!count || typeof count.result !== "number") {
        throw new Error(`Upstash rate limit gave an unexpected reply: ${JSON.stringify(body).slice(0, 200)}`);
      }
      return count.result <= limit
        ? { allowed: true, retryAfterMs: 0 }
        : { allowed: false, retryAfterMs: (window + 1) * windowMs - now };
    },
  };
}

/**
 * Uses `shared` when it works and `local` when it throws, logging the failure.
 * Failing over (instead of refusing) keeps real customers able to order
 * during an outage; the in-memory limit still applies meanwhile.
 */
export function withFallback(
  shared: SharedRateLimiter | null,
  local: RateLimiter,
  logError: (message: string, error: unknown) => void,
): SharedRateLimiter {
  return {
    async attempt(key, now) {
      if (!shared) return local.attempt(key, now);
      try {
        return await shared.attempt(key, now);
      } catch (error) {
        logError("Shared rate limiter failed; using the in-memory limit", error);
        return local.attempt(key, now);
      }
    },
  };
}
