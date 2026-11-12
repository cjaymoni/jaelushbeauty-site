/**
 * Order requests: validating what a customer submits and writing the emails
 * that go to the shop and back to the customer. Nothing here talks to the
 * network, so it can be tested directly; see order-email.ts for sending.
 */
import { basketItemCount, itemCountLabel, sanitizeBasket } from "./basket.ts";
import { productPath } from "./catalog.ts";
import type { Product } from "./products.ts";
import { SITE_NAME, absoluteUrl } from "./site.ts";

export const FULFILMENT_OPTIONS = ["delivery", "pickup"] as const;
export type Fulfilment = (typeof FULFILMENT_OPTIONS)[number];

export const FULFILMENT_LABELS: Record<Fulfilment, string> = {
  delivery: "Delivery",
  pickup: "Pickup",
};

/** Form field names. The honeypot is hidden from people; bots tend to fill it in. */
export const ORDER_FIELDS = {
  name: "name",
  phone: "phone",
  email: "email",
  fulfilment: "fulfilment",
  address: "address",
  notes: "notes",
  items: "items",
  honeypot: "company",
} as const;

export type OrderField = Exclude<keyof typeof ORDER_FIELDS, "honeypot">;

export const ORDER_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  emailMax: 254,
  addressMax: 300,
  notesMax: 500,
  /** Digits in a phone number, with or without the country code. */
  phoneDigitsMin: 9,
  phoneDigitsMax: 15,
} as const;

export type OrderItem = {
  slug: string;
  name: string;
  variant: string;
  quantity: number;
  url: string;
};

export type Order = {
  name: string;
  phone: string;
  email: string;
  fulfilment: Fulfilment;
  /** Empty for pickup. */
  address: string;
  notes: string;
  items: OrderItem[];
};

export type FieldErrors = Partial<Record<OrderField, string>>;

export type ValidationResult =
  | { ok: true; order: Order }
  | { ok: false; fieldErrors: FieldErrors }
  /** The honeypot was filled in. Treat as spam: do not send, but do not tell the bot. */
  | { ok: false; spam: true };

/** Reads a form field as a string. Files and missing fields become "". */
export function readField(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

/** Trims and collapses whitespace, including line breaks, for one-line fields like a name. */
function singleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Trims and normalises line endings for multi-line fields, and caps blank lines at one. */
function multiLine(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Letters (any script), spaces, apostrophes, hyphens and dots, as in "N'Dri" or "St. Clair". */
const NAME_PATTERN = /^[\p{L}\p{M}' ’.\-]+$/u;
/** A dot straight before a letter looks like a web address ("spam.com"), which a name never needs. */
const NAME_LOOKS_LIKE_LINK = /\.\p{L}/u;
const PHONE_ALLOWED = /^\+?[\d\s\-().]+$/;

/**
 * Checks a submitted order against the catalog. Messages are written for the
 * customer and say how to fix the field. Product names and links come from
 * the catalog, never from the form.
 */
export function validateOrder(form: FormData, catalog: readonly Product[]): ValidationResult {
  if (readField(form, ORDER_FIELDS.honeypot).trim() !== "") return { ok: false, spam: true };

  const fieldErrors: FieldErrors = {};
  const name = singleLine(readField(form, ORDER_FIELDS.name));
  const phone = singleLine(readField(form, ORDER_FIELDS.phone));
  const email = singleLine(readField(form, ORDER_FIELDS.email)).toLowerCase();
  const fulfilmentRaw = readField(form, ORDER_FIELDS.fulfilment);
  const address = multiLine(readField(form, ORDER_FIELDS.address));
  const notes = multiLine(readField(form, ORDER_FIELDS.notes));

  if (name.length < ORDER_LIMITS.nameMin) fieldErrors.name = "Enter your name so we know who the order is for.";
  else if (name.length > ORDER_LIMITS.nameMax)
    fieldErrors.name = `Keep your name under ${ORDER_LIMITS.nameMax} characters.`;
  // The name is repeated in the customer's confirmation email, so links must not get through.
  else if (!NAME_PATTERN.test(name) || NAME_LOOKS_LIKE_LINK.test(name))
    fieldErrors.name = "Use letters only in your name.";

  const phoneDigits = phone.replace(/\D/g, "").length;
  if (phone === "") fieldErrors.phone = "Enter a phone number so we can confirm your order.";
  else if (
    !PHONE_ALLOWED.test(phone) ||
    phoneDigits < ORDER_LIMITS.phoneDigitsMin ||
    phoneDigits > ORDER_LIMITS.phoneDigitsMax
  )
    fieldErrors.phone = "Enter a phone number like 024 123 4567 or +233 24 123 4567.";

  if (email === "") fieldErrors.email = "Enter your email so we can send your order confirmation.";
  else if (email.length > ORDER_LIMITS.emailMax || !EMAIL_PATTERN.test(email))
    fieldErrors.email = "Enter an email address like name@example.com.";

  const fulfilment = (FULFILMENT_OPTIONS as readonly string[]).includes(fulfilmentRaw)
    ? (fulfilmentRaw as Fulfilment)
    : undefined;
  if (!fulfilment) fieldErrors.fulfilment = "Choose delivery or pickup.";

  if (fulfilment === "delivery") {
    if (address === "") fieldErrors.address = "Enter a delivery address, area or landmark.";
    else if (address.length > ORDER_LIMITS.addressMax)
      fieldErrors.address = `Keep the address under ${ORDER_LIMITS.addressMax} characters.`;
  }

  if (notes.length > ORDER_LIMITS.notesMax)
    fieldErrors.notes = `Keep your note under ${ORDER_LIMITS.notesMax} characters.`;

  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  let parsedItems: unknown;
  try {
    parsedItems = JSON.parse(readField(form, ORDER_FIELDS.items) || "[]");
  } catch {
    parsedItems = [];
  }
  const lines = sanitizeBasket(parsedItems, new Set(bySlug.keys()));
  if (lines.length === 0) fieldErrors.items = "Your basket is empty. Add a product before sending your order.";

  if (Object.keys(fieldErrors).length > 0 || !fulfilment) return { ok: false, fieldErrors };

  const items = lines.map((l) => {
    const product = bySlug.get(l.slug)!;
    return {
      slug: product.slug,
      name: product.name,
      variant: product.variant,
      quantity: l.quantity,
      url: absoluteUrl(productPath(product)),
    };
  });

  return {
    ok: true,
    order: {
      name,
      phone,
      email,
      fulfilment,
      address: fulfilment === "delivery" ? address : "",
      notes,
      items,
    },
  };
}

/** Letters and digits that cannot be mistaken for each other when read aloud or retyped. */
const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const REFERENCE_CODE_LENGTH = 4;

/**
 * A short reference like "JB-1112-K7QM" that the customer can quote. Month and
 * day make it easy to find in the inbox; the code tells same-day orders apart.
 * `randomBytes` is injected so tests are repeatable.
 */
export function createOrderReference(now: Date, randomBytes: (count: number) => Uint8Array): string {
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `JB-${month}${day}-${unbiasedCode(randomBytes)}`;
}

/** Largest byte count that divides evenly by the alphabet size; bytes at or above it are redrawn. */
const UNBIASED_BYTE_LIMIT = 256 - (256 % REFERENCE_ALPHABET.length);
/** Gives up rather than loop forever if the byte source is broken (e.g. always returns 255). */
const MAX_REFERENCE_DRAWS = 16;

/**
 * Picks code characters with rejection sampling: `byte % 31` alone would make
 * the first 8 characters slightly more likely, because 256 is not a multiple of 31.
 */
function unbiasedCode(randomBytes: (count: number) => Uint8Array): string {
  let code = "";
  for (let draw = 0; draw < MAX_REFERENCE_DRAWS && code.length < REFERENCE_CODE_LENGTH; draw++) {
    for (const byte of randomBytes(REFERENCE_CODE_LENGTH)) {
      if (byte < UNBIASED_BYTE_LIMIT && code.length < REFERENCE_CODE_LENGTH) {
        code += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
      }
    }
  }
  if (code.length < REFERENCE_CODE_LENGTH) {
    throw new Error(`createOrderReference: random source gave no usable bytes in ${MAX_REFERENCE_DRAWS} draws`);
  }
  return code;
}

/** Escapes text for HTML element content and quoted attributes. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailContent = { subject: string; text: string; html: string };

/** Colours for the HTML emails. Email clients ignore CSS variables, so these are literal. */
const EMAIL_COLOURS = { text: "#3b2418", soft: "#6e5546", line: "#ddcdb6", accent: "#a8492a", bg: "#f7f0e5" };

function itemsText(items: OrderItem[]): string {
  return items.map((i) => `  ${i.quantity} × ${i.name} (${i.variant})`).join("\n");
}

function itemsHtml(items: OrderItem[]): string {
  const rows = items
    .map(
      (i) => `<tr>
<td style="padding:10px 0;border-top:1px solid ${EMAIL_COLOURS.line};font-weight:600;width:48px">${i.quantity} ×</td>
<td style="padding:10px 0;border-top:1px solid ${EMAIL_COLOURS.line}"><a href="${escapeHtml(i.url)}" style="color:${EMAIL_COLOURS.text}">${escapeHtml(i.name)}</a><br><span style="color:${EMAIL_COLOURS.soft};font-size:14px">${escapeHtml(i.variant)}</span></td>
</tr>`,
    )
    .join("\n");
  return `<table role="presentation" style="width:100%;border-collapse:collapse;margin:8px 0 24px">${rows}</table>`;
}

function detailsRows(order: Order): [string, string][] {
  const rows: [string, string][] = [
    ["Name", order.name],
    ["Phone", order.phone],
    ["Email", order.email],
    [FULFILMENT_LABELS[order.fulfilment], order.fulfilment === "delivery" ? order.address : "Customer will collect"],
  ];
  if (order.notes) rows.push(["Notes", order.notes]);
  return rows;
}

function emailShell(heading: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:${EMAIL_COLOURS.bg};font-family:Helvetica,Arial,sans-serif;color:${EMAIL_COLOURS.text};line-height:1.5">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="font-family:Georgia,serif;font-size:22px;margin:0 0 24px">Jaelush <em style="color:${EMAIL_COLOURS.accent}">Beauty</em></p>
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:26px;margin:0 0 16px">${heading}</h1>
${body}
</div></body></html>`;
}

/** The email the shop receives. Reply-to is the customer, so replying reaches them directly. */
export function shopOrderEmail(order: Order, reference: string): EmailContent {
  const count = itemCountLabel(basketItemCount(order.items));
  const subject = `New order ${reference}: ${order.name} (${count})`;
  const details = detailsRows(order);

  const text = [
    `New order request ${reference}`,
    "",
    "Items:",
    itemsText(order.items),
    "",
    ...details.map(([k, v]) => `${k}: ${v}`),
    "",
    "Reply to this email to confirm the total, payment and delivery or pickup with the customer.",
  ].join("\n");

  const detailsHtml = details
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:${EMAIL_COLOURS.soft};vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;white-space:pre-line">${escapeHtml(v)}</td></tr>`,
    )
    .join("\n");

  const html = emailShell(
    `New order <span style="color:${EMAIL_COLOURS.accent}">${escapeHtml(reference)}</span>`,
    `<p style="margin:0 0 8px;font-weight:600">${escapeHtml(count)}</p>
${itemsHtml(order.items)}
<table role="presentation" style="border-collapse:collapse;margin:0 0 24px">${detailsHtml}</table>
<p style="color:${EMAIL_COLOURS.soft};font-size:14px;margin:0">Reply to this email to confirm the total, payment and delivery or pickup with ${escapeHtml(order.name)}.</p>`,
  );

  return { subject, text, html };
}

/** The confirmation copy the customer receives. */
export function customerOrderEmail(order: Order, reference: string): EmailContent {
  const subject = `We’ve received your order ${reference}`;
  const firstName = order.name.split(" ")[0];
  const next =
    order.fulfilment === "delivery"
      ? "We’ll be in touch shortly with your total and to arrange payment and delivery."
      : "We’ll be in touch shortly with your total and to arrange payment and a pickup time.";

  const text = [
    `Hi ${firstName},`,
    "",
    `Thank you for your order. Your reference is ${reference}.`,
    "",
    "You asked for:",
    itemsText(order.items),
    "",
    next,
    "If anything needs changing, just reply to this email.",
    "",
    SITE_NAME,
  ].join("\n");

  const html = emailShell(
    `Thank you, ${escapeHtml(firstName)}`,
    `<p style="margin:0 0 16px">We’ve received your order. Your reference is <strong>${escapeHtml(reference)}</strong>.</p>
${itemsHtml(order.items)}
<p style="margin:0 0 12px">${escapeHtml(next)}</p>
<p style="color:${EMAIL_COLOURS.soft};margin:0">If anything needs changing, just reply to this email.</p>`,
  );

  return { subject, text, html };
}
