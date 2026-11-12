/**
 * Basket state, kept as plain data so it can live in localStorage and be
 * sent with an order. Prices are not part of the basket: orders are requests
 * that the shop confirms with a total by email.
 */

export const BASKET_PATH = "/basket";

/** Most of one product a customer can request in a single order. Larger orders go through Contact. */
export const MAX_QUANTITY_PER_LINE = 20;

export type BasketLine = { slug: string; quantity: number };

export type BasketAction =
  | { type: "add"; slug: string; quantity: number }
  | { type: "set"; slug: string; quantity: number }
  | { type: "remove"; slug: string }
  | { type: "clear" }
  /** Replaces the whole basket, e.g. after reading storage or another tab's change. */
  | { type: "replace"; lines: BasketLine[] };

/** Clamps to a whole number between 0 and the per-line maximum. Non-numbers become 0. */
export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 0;
  return Math.min(MAX_QUANTITY_PER_LINE, Math.max(0, Math.floor(quantity)));
}

/** Applies an action. Lines that reach zero are removed; new products go to the end. */
export function basketReducer(lines: BasketLine[], action: BasketAction): BasketLine[] {
  switch (action.type) {
    case "add": {
      const existing = lines.find((l) => l.slug === action.slug);
      const quantity = clampQuantity((existing?.quantity ?? 0) + action.quantity);
      if (quantity === 0) return lines.filter((l) => l.slug !== action.slug);
      if (existing) return lines.map((l) => (l.slug === action.slug ? { ...l, quantity } : l));
      return [...lines, { slug: action.slug, quantity }];
    }
    case "set": {
      const quantity = clampQuantity(action.quantity);
      if (quantity === 0) return lines.filter((l) => l.slug !== action.slug);
      return lines.map((l) => (l.slug === action.slug ? { ...l, quantity } : l));
    }
    case "remove":
      return lines.filter((l) => l.slug !== action.slug);
    case "clear":
      return [];
    case "replace":
      return action.lines;
  }
}

/** How many more of a product fit under the per-line maximum, e.g. 2 when 18 are already in the basket. */
export function remainingQuantity(lines: BasketLine[], slug: string): number {
  const inBasket = lines.find((l) => l.slug === slug)?.quantity ?? 0;
  return Math.max(0, MAX_QUANTITY_PER_LINE - inBasket);
}

/** Total number of items, e.g. for the header badge. */
export function basketItemCount(lines: BasketLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

/**
 * Turns untrusted data (localStorage, a submitted form) into basket lines.
 * Drops unknown products and bad quantities, merges duplicate products and
 * clamps quantities, so a tampered or outdated basket never breaks the page.
 */
export function sanitizeBasket(value: unknown, knownSlugs: ReadonlySet<string>): BasketLine[] {
  if (!Array.isArray(value)) return [];
  let lines: BasketLine[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const { slug, quantity } = item as Record<string, unknown>;
    if (typeof slug !== "string" || !knownSlugs.has(slug)) continue;
    if (typeof quantity !== "number") continue;
    lines = basketReducer(lines, { type: "add", slug, quantity });
  }
  return lines;
}

/** Parses a stored basket. Invalid JSON gives an empty basket rather than an error. */
export function parseBasket(raw: string | null, knownSlugs: ReadonlySet<string>): BasketLine[] {
  if (!raw) return [];
  try {
    return sanitizeBasket(JSON.parse(raw), knownSlugs);
  } catch {
    return [];
  }
}

const itemPlurals = new Intl.PluralRules("en");

/** "1 item", "3 items". */
export function itemCountLabel(count: number): string {
  return `${count} ${itemPlurals.select(count) === "one" ? "item" : "items"}`;
}
