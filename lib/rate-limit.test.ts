import { test } from "node:test";
import assert from "node:assert/strict";
import { clientIp, createRateLimiter, createUpstashRateLimiter, readUpstashConfig, withFallback } from "./rate-limit.ts";

test("allows up to the limit in a window, then blocks with a retry time", () => {
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, maxKeys: 10 });
  assert.equal(limiter.attempt("a", 0).allowed, true);
  assert.equal(limiter.attempt("a", 100).allowed, true);
  assert.deepEqual(limiter.attempt("a", 400), { allowed: false, retryAfterMs: 600 });
});

test("attempts older than the window no longer count", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 10 });
  assert.equal(limiter.attempt("a", 0).allowed, true);
  assert.equal(limiter.attempt("a", 999).allowed, false);
  assert.equal(limiter.attempt("a", 1000).allowed, true);
});

test("keys are limited independently", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 10 });
  assert.equal(limiter.attempt("a", 0).allowed, true);
  assert.equal(limiter.attempt("b", 0).allowed, true);
});

test("the least recently used key is forgotten when maxKeys is exceeded", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
  limiter.attempt("a", 0);
  limiter.attempt("b", 0);
  limiter.attempt("c", 0); // evicts "a"
  assert.equal(limiter.attempt("a", 1).allowed, true);
  assert.equal(limiter.attempt("c", 1).allowed, false);
});

test("invalid options throw", () => {
  assert.throws(() => createRateLimiter({ limit: 0, windowMs: 1000, maxKeys: 1 }), RangeError);
});

test("clientIp prefers the first forwarded address, then x-real-ip, then 'unknown'", () => {
  const h = (values: Record<string, string>) => (name: string) => values[name] ?? null;
  assert.equal(clientIp(h({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" })), "203.0.113.5");
  assert.equal(clientIp(h({ "x-real-ip": "198.51.100.2" })), "198.51.100.2");
  assert.equal(clientIp(h({})), "unknown");
});

const upstash = { url: "https://example.upstash.io", token: "test-token" };

function upstashReplying(count: number, calls: { url: string; init: RequestInit }[] = []): typeof fetch {
  return (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify([{ result: count }, { result: 1 }]), { status: 200 });
  }) as typeof fetch;
}

test("readUpstashConfig needs both values and trims a trailing slash", () => {
  assert.equal(readUpstashConfig({ UPSTASH_REDIS_REST_URL: "https://x.io" }), null);
  assert.deepEqual(readUpstashConfig({ UPSTASH_REDIS_REST_URL: " https://x.io/ ", UPSTASH_REDIS_REST_TOKEN: "t" }), {
    url: "https://x.io",
    token: "t",
  });
});

test("the Upstash limiter counts per key and window, and sets an expiry", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const limiter = createUpstashRateLimiter({ config: upstash, limit: 5, windowMs: 1000, prefix: "orders", fetchImpl: upstashReplying(3, calls) });
  assert.deepEqual(await limiter.attempt("203.0.113.5", 2500), { allowed: true, retryAfterMs: 0 });
  assert.equal(calls[0].url, "https://example.upstash.io/pipeline");
  assert.equal((calls[0].init.headers as Record<string, string>).Authorization, "Bearer test-token");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), [
    ["INCR", "orders:203.0.113.5:2"],
    ["PEXPIRE", "orders:203.0.113.5:2", "1000"],
  ]);
});

test("the Upstash limiter blocks past the limit until the window ends", async () => {
  const limiter = createUpstashRateLimiter({ config: upstash, limit: 5, windowMs: 1000, prefix: "orders", fetchImpl: upstashReplying(6) });
  assert.deepEqual(await limiter.attempt("a", 2500), { allowed: false, retryAfterMs: 500 });
});

test("the Upstash limiter throws on HTTP errors and malformed replies", async () => {
  const failing = (async () => new Response("unauthorized", { status: 401 })) as unknown as typeof fetch;
  const odd = (async () => new Response(JSON.stringify([{ error: "ERR" }]), { status: 200 })) as unknown as typeof fetch;
  for (const [fetchImpl, pattern] of [[failing, /401.*unauthorized/], [odd, /unexpected reply/]] as const) {
    const limiter = createUpstashRateLimiter({ config: upstash, limit: 5, windowMs: 1000, prefix: "orders", fetchImpl });
    await assert.rejects(limiter.attempt("a", 0), pattern);
  }
});

test("withFallback uses the in-memory limit and logs when the shared store fails", async () => {
  const logged: string[] = [];
  const broken = { attempt: async () => { throw new Error("down"); } };
  const limiter = withFallback(broken, createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 10 }), (m) => logged.push(m));
  assert.equal((await limiter.attempt("a", 0)).allowed, true);
  assert.equal((await limiter.attempt("a", 1)).allowed, false);
  assert.equal(logged.length, 2);
});

test("withFallback without a shared store uses memory only", async () => {
  const limiter = withFallback(null, createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 10 }), () => assert.fail("no log expected"));
  assert.equal((await limiter.attempt("a", 0)).allowed, true);
  assert.equal((await limiter.attempt("a", 1)).allowed, false);
});
