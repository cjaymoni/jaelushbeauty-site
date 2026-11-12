import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ORDER_EMAIL_FROM,
  ORDER_FAILED_MESSAGE,
  ORDER_RATE_LIMITED_MESSAGE,
  createResendSender,
  placeOrder,
  readOrderEmailConfig,
  type OutgoingEmail,
  type PlaceOrderDeps,
} from "./order-email.ts";
import { ORDER_FIELDS } from "./order.ts";
import { products } from "./products.ts";

function validForm(): FormData {
  const f = new FormData();
  f.set(ORDER_FIELDS.name, "Ama Mensah");
  f.set(ORDER_FIELDS.phone, "0241234567");
  f.set(ORDER_FIELDS.email, "ama@example.com");
  f.set(ORDER_FIELDS.fulfilment, "pickup");
  f.set(ORDER_FIELDS.items, JSON.stringify([{ slug: "detox-bar", quantity: 1 }]));
  return f;
}

function deps(send: PlaceOrderDeps["send"], errors: string[] = []): PlaceOrderDeps {
  return {
    catalog: products,
    shopEmail: "shop@example.com",
    send,
    now: () => new Date("2026-11-12T09:00:00Z"),
    randomBytes: (n) => new Uint8Array(n).fill(1),
    logError: (message) => errors.push(message),
    allowSend: () => true,
  };
}

test("config reports every missing variable and defaults the sender", () => {
  assert.deepEqual(readOrderEmailConfig({}), { ok: false, missing: ["RESEND_API_KEY", "ORDER_EMAIL_TO"] });
  assert.deepEqual(readOrderEmailConfig({ RESEND_API_KEY: "re_1", ORDER_EMAIL_TO: " shop@example.com " }), {
    ok: true,
    config: { apiKey: "re_1", to: "shop@example.com", from: DEFAULT_ORDER_EMAIL_FROM },
  });
});

test("a valid order emails the shop first, then the customer, with matching reply-to addresses", async () => {
  const sent: OutgoingEmail[] = [];
  const state = await placeOrder(validForm(), deps(async (e) => void sent.push(e)));
  assert.equal(state.status, "sent");
  assert.ok(state.status === "sent" && state.confirmationSent);
  assert.deepEqual(
    sent.map((e) => [e.to, e.replyTo]),
    [
      ["shop@example.com", "ama@example.com"],
      ["ama@example.com", "shop@example.com"],
    ],
  );
  assert.equal(sent[0].idempotencyKey, `order-${"01".repeat(16)}-shop`);
});

test("two orders with the same reference still get different idempotency keys", async () => {
  // Same clock and same 4-letter code, so the references collide; the keys must not.
  let counter = 0;
  const keys: string[] = [];
  const d = deps(async (e) => void keys.push(e.idempotencyKey));
  d.randomBytes = (n) => (n === 4 ? new Uint8Array(4) : new Uint8Array(n).fill(++counter));
  const a = await placeOrder(validForm(), d);
  const b = await placeOrder(validForm(), d);
  assert.ok(a.status === "sent" && b.status === "sent" && a.reference === b.reference);
  assert.equal(new Set(keys).size, keys.length);
});

test("an invalid order sends nothing and returns the field errors", async () => {
  const sent: OutgoingEmail[] = [];
  const f = validForm();
  f.set(ORDER_FIELDS.email, "nope");
  const state = await placeOrder(f, deps(async (e) => void sent.push(e)));
  assert.equal(sent.length, 0);
  assert.ok(state.status === "invalid" && state.fieldErrors.email);
});

test("a refused send emails nothing; invalid orders are rejected before the limit is consulted", async () => {
  const sent: OutgoingEmail[] = [];
  let asked = 0;
  const d = deps(async (e) => void sent.push(e));
  d.allowSend = () => (asked++, false);

  const bad = validForm();
  bad.set(ORDER_FIELDS.email, "nope");
  assert.equal((await placeOrder(bad, d)).status, "invalid");
  assert.equal(asked, 0);

  assert.deepEqual(await placeOrder(validForm(), d), { status: "failed", message: ORDER_RATE_LIMITED_MESSAGE });
  assert.equal(asked, 1);
  assert.equal(sent.length, 0);
});

test("an async limit check (e.g. a shared store) is awaited before sending", async () => {
  const sent: OutgoingEmail[] = [];
  const d = deps(async (e) => void sent.push(e));
  d.allowSend = async () => false;
  assert.deepEqual(await placeOrder(validForm(), d), { status: "failed", message: ORDER_RATE_LIMITED_MESSAGE });
  assert.equal(sent.length, 0);

  d.allowSend = async () => true;
  assert.equal((await placeOrder(validForm(), d)).status, "sent");
  assert.equal(sent.length, 2);
});

test("spam looks successful but sends nothing", async () => {
  const sent: OutgoingEmail[] = [];
  const f = validForm();
  f.set(ORDER_FIELDS.honeypot, "bot");
  const state = await placeOrder(f, deps(async (e) => void sent.push(e)));
  assert.equal(state.status, "sent");
  assert.equal(sent.length, 0);
});

test("if the shop email fails, the order fails, is logged and the customer is not emailed", async () => {
  const errors: string[] = [];
  let calls = 0;
  const state = await placeOrder(
    validForm(),
    deps(async () => {
      calls++;
      throw new Error("network down");
    }, errors),
  );
  assert.deepEqual(state, { status: "failed", message: ORDER_FAILED_MESSAGE });
  assert.equal(calls, 1);
  assert.match(errors[0], /shop email failed/);
});

test("if only the customer copy fails, the order still succeeds and the failure is logged", async () => {
  const errors: string[] = [];
  const state = await placeOrder(
    validForm(),
    deps(async (e) => {
      if (e.to === "ama@example.com") throw new Error("bounced");
    }, errors),
  );
  assert.ok(state.status === "sent" && !state.confirmationSent);
  assert.match(errors[0], /customer confirmation failed/);
});

test("the Resend sender posts JSON with auth and idempotency headers, and throws on errors", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const okFetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response("{}", { status: 200 });
  }) as unknown as typeof fetch;
  const send = createResendSender({ apiKey: "re_test", to: "shop@example.com", from: "Shop <o@x.com>" }, okFetch);
  const email: OutgoingEmail = { to: "a@b.com", replyTo: "c@d.com", subject: "S", text: "T", html: "H", idempotencyKey: "k1" };
  await send(email);
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.equal(headers.Authorization, "Bearer re_test");
  assert.equal(headers["Idempotency-Key"], "k1");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    from: "Shop <o@x.com>",
    to: ["a@b.com"],
    reply_to: "c@d.com",
    subject: "S",
    text: "T",
    html: "H",
  });

  const failFetch = (async () => new Response("domain not verified", { status: 403 })) as unknown as typeof fetch;
  const failing = createResendSender({ apiKey: "re_test", to: "x", from: "y" }, failFetch);
  await assert.rejects(failing(email), /403.*domain not verified/);
});
