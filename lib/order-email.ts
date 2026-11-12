/**
 * Sends order emails and runs the whole "place an order" step. The network
 * call and the environment are passed in, so the flow can be tested without
 * sending real email.
 */
import {
  createOrderReference,
  customerOrderEmail,
  shopOrderEmail,
  validateOrder,
  type EmailContent,
  type FieldErrors,
  type Fulfilment,
} from "./order.ts";
import type { Product } from "./products.ts";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
/** Used when ORDER_EMAIL_FROM is not set. The domain must be verified in Resend. */
export const DEFAULT_ORDER_EMAIL_FROM = "Jaelush Beauty <orders@jaelushbeauty.com>";

export type OrderEmailConfig = { apiKey: string; to: string; from: string };

/**
 * Reads email settings from the environment. Returns the names of any missing
 * required variables instead of throwing, so the caller decides what to do.
 */
export function readOrderEmailConfig(
  env: Record<string, string | undefined>,
): { ok: true; config: OrderEmailConfig } | { ok: false; missing: string[] } {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const to = env.ORDER_EMAIL_TO?.trim() ?? "";
  const from = env.ORDER_EMAIL_FROM?.trim() || DEFAULT_ORDER_EMAIL_FROM;
  const missing = [!apiKey && "RESEND_API_KEY", !to && "ORDER_EMAIL_TO"].filter((v): v is string => Boolean(v));
  return missing.length > 0 ? { ok: false, missing } : { ok: true, config: { apiKey, to, from } };
}

export type OutgoingEmail = EmailContent & {
  to: string;
  replyTo: string;
  /**
   * Resend delivers only one email per key within 24 hours, so the key must be
   * unique per submission. It is NOT the order reference, which can repeat.
   */
  idempotencyKey: string;
};

/** Bytes of randomness in a submission id (128 bits, so ids never collide in practice). */
const SUBMISSION_ID_BYTES = 16;

function submissionId(randomBytes: (count: number) => Uint8Array): string {
  return Array.from(randomBytes(SUBMISSION_ID_BYTES), (b) => b.toString(16).padStart(2, "0")).join("");
}

export type SendEmail = (email: OutgoingEmail) => Promise<void>;

/** Sends through Resend's HTTP API. Throws with Resend's status and message on failure. */
export function createResendSender(config: OrderEmailConfig, fetchImpl: typeof fetch = fetch): SendEmail {
  return async (email) => {
    const res = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": email.idempotencyKey,
      },
      body: JSON.stringify({
        from: config.from,
        to: [email.to],
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Resend rejected email "${email.subject}" (${res.status}): ${detail.slice(0, 300)}`);
    }
  };
}

export type OrderState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: FieldErrors }
  | { status: "failed"; message: string }
  | {
      status: "sent";
      reference: string;
      fulfilment: Fulfilment;
      /** False when the shop got the order but the customer's copy failed. */
      confirmationSent: boolean;
      email: string;
    };

export type PlaceOrderDeps = {
  catalog: readonly Product[];
  /** The shop's inbox. */
  shopEmail: string;
  send: SendEmail;
  now: () => Date;
  randomBytes: (count: number) => Uint8Array;
  logError: (message: string, error?: unknown) => void;
  /**
   * Asked once a valid order is about to be emailed; false refuses it. Checked
   * after validation so customers fixing typos are never counted.
   */
  allowSend: () => boolean | Promise<boolean>;
};

export const ORDER_RATE_LIMITED_MESSAGE =
  "You’ve sent several orders in a short time. Please wait a few minutes and try again, or message us on Instagram.";

export const ORDER_FAILED_MESSAGE =
  "We couldn’t send your order just now. Your basket is saved. Please try again in a moment, or message us on Instagram.";

/**
 * Validates the form, emails the order to the shop, then sends the customer a
 * copy. The shop email must succeed for the order to count. A failed customer
 * copy is logged and reported, but does not fail the order.
 */
export async function placeOrder(form: FormData, deps: PlaceOrderDeps): Promise<OrderState> {
  const result = validateOrder(form, deps.catalog);
  if (!result.ok) {
    if ("spam" in result) {
      // Look like success so bots learn nothing, but send nothing.
      const reference = createOrderReference(deps.now(), deps.randomBytes);
      return { status: "sent", reference, fulfilment: "pickup", confirmationSent: false, email: "" };
    }
    return { status: "invalid", fieldErrors: result.fieldErrors };
  }

  if (!(await deps.allowSend())) return { status: "failed", message: ORDER_RATE_LIMITED_MESSAGE };

  const { order } = result;
  const reference = createOrderReference(deps.now(), deps.randomBytes);
  const id = submissionId(deps.randomBytes);

  try {
    await deps.send({
      ...shopOrderEmail(order, reference),
      to: deps.shopEmail,
      replyTo: order.email,
      idempotencyKey: `order-${id}-shop`,
    });
  } catch (error) {
    deps.logError(`Order ${reference}: shop email failed`, error);
    return { status: "failed", message: ORDER_FAILED_MESSAGE };
  }

  let confirmationSent = true;
  try {
    await deps.send({
      ...customerOrderEmail(order, reference),
      to: order.email,
      replyTo: deps.shopEmail,
      idempotencyKey: `order-${id}-customer`,
    });
  } catch (error) {
    confirmationSent = false;
    deps.logError(`Order ${reference}: customer confirmation failed (shop email was sent)`, error);
  }

  return { status: "sent", reference, fulfilment: order.fulfilment, confirmationSent, email: order.email };
}
