"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import {
  ORDER_FAILED_MESSAGE,
  createResendSender,
  placeOrder,
  readOrderEmailConfig,
  type OrderState,
  type SendEmail,
} from "@/lib/order-email";
import { products } from "@/lib/products";
import {
  clientIp,
  createRateLimiter,
  createUpstashRateLimiter,
  readUpstashConfig,
  withFallback,
} from "@/lib/rate-limit";

/**
 * Orders allowed per visitor in a window. Real customers send one or two; this
 * mainly stops bots using the form to send confirmation emails to strangers.
 */
const ORDER_LIMIT = 5;
const ORDER_WINDOW_MS = 15 * 60 * 1000;
/** Visitors remembered by the in-memory limiter before the oldest are forgotten. */
const ORDER_LIMITER_MAX_KEYS = 5000;

const upstash = readUpstashConfig(process.env);
/** Shared across instances when Upstash is configured (see README), otherwise per instance. */
const orderLimiter = withFallback(
  upstash && createUpstashRateLimiter({ config: upstash, limit: ORDER_LIMIT, windowMs: ORDER_WINDOW_MS, prefix: "orders" }),
  createRateLimiter({ limit: ORDER_LIMIT, windowMs: ORDER_WINDOW_MS, maxKeys: ORDER_LIMITER_MAX_KEYS }),
  (message, error) => console.error(message, error),
);

/** In development without Resend set up, print emails to the terminal so the flow can be tried. */
const logSender: SendEmail = async (email) => {
  console.info(`\n[order email → ${email.to}] ${email.subject}\n${email.text}\n`);
};

/**
 * Form action for the checkout. Anyone can POST to it, so everything is
 * re-validated on the server against the catalog (see validateOrder).
 */
export async function submitOrder(_previous: OrderState, form: FormData): Promise<OrderState> {
  const settings = readOrderEmailConfig(process.env);
  let send: SendEmail;
  let shopEmail: string;

  if (settings.ok) {
    send = createResendSender(settings.config);
    shopEmail = settings.config.to;
  } else if (process.env.NODE_ENV !== "production") {
    console.warn(`Order emails are only logged: set ${settings.missing.join(" and ")} to send them.`);
    send = logSender;
    shopEmail = process.env.ORDER_EMAIL_TO || "shop@localhost";
  } else {
    console.error(`Order rejected: missing ${settings.missing.join(", ")} in the environment.`);
    return { status: "failed", message: ORDER_FAILED_MESSAGE };
  }

  const requestHeaders = await headers();
  const ip = clientIp((name) => requestHeaders.get(name));

  return placeOrder(form, {
    catalog: products,
    shopEmail,
    send,
    now: () => new Date(),
    randomBytes: (n) => new Uint8Array(randomBytes(n)),
    logError: (message, error) => console.error(message, error),
    allowSend: async () => {
      const { allowed, retryAfterMs } = await orderLimiter.attempt(ip, Date.now());
      if (!allowed) console.warn(`Order rate-limited for ${ip}; retry in ${Math.ceil(retryAfterMs / 1000)}s`);
      return allowed;
    },
  });
}
