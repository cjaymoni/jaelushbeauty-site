import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_QUANTITY_PER_LINE,
  basketItemCount,
  basketReducer,
  clampQuantity,
  itemCountLabel,
  parseBasket,
  remainingQuantity,
  sanitizeBasket,
} from "./basket.ts";

const known = new Set(["glow-bar", "detox-bar"]);

test("adding a new product appends a line; adding again increases its quantity", () => {
  let lines = basketReducer([], { type: "add", slug: "glow-bar", quantity: 1 });
  lines = basketReducer(lines, { type: "add", slug: "detox-bar", quantity: 2 });
  lines = basketReducer(lines, { type: "add", slug: "glow-bar", quantity: 3 });
  assert.deepEqual(lines, [
    { slug: "glow-bar", quantity: 4 },
    { slug: "detox-bar", quantity: 2 },
  ]);
});

test("quantities never go above the per-line maximum", () => {
  const lines = basketReducer([{ slug: "glow-bar", quantity: 18 }], {
    type: "add",
    slug: "glow-bar",
    quantity: 10,
  });
  assert.deepEqual(lines, [{ slug: "glow-bar", quantity: MAX_QUANTITY_PER_LINE }]);
});

test("setting a quantity to zero or less removes the line", () => {
  const start = [{ slug: "glow-bar", quantity: 2 }];
  assert.deepEqual(basketReducer(start, { type: "set", slug: "glow-bar", quantity: 0 }), []);
  assert.deepEqual(basketReducer(start, { type: "set", slug: "glow-bar", quantity: -4 }), []);
});

test("setting a quantity for a product not in the basket changes nothing", () => {
  const start = [{ slug: "glow-bar", quantity: 2 }];
  assert.deepEqual(basketReducer(start, { type: "set", slug: "detox-bar", quantity: 3 }), start);
});

test("remove and clear empty the basket", () => {
  const start = [
    { slug: "glow-bar", quantity: 2 },
    { slug: "detox-bar", quantity: 1 },
  ];
  assert.deepEqual(basketReducer(start, { type: "remove", slug: "glow-bar" }), [
    { slug: "detox-bar", quantity: 1 },
  ]);
  assert.deepEqual(basketReducer(start, { type: "clear" }), []);
});

test("clampQuantity floors fractions and treats NaN and Infinity as zero", () => {
  assert.equal(clampQuantity(2.7), 2);
  assert.equal(clampQuantity(Number.NaN), 0);
  assert.equal(clampQuantity(Number.POSITIVE_INFINITY), 0);
});

test("sanitizeBasket drops unknown products and malformed lines and merges duplicates", () => {
  const lines = sanitizeBasket(
    [
      { slug: "glow-bar", quantity: 2 },
      { slug: "not-a-product", quantity: 1 },
      { slug: "detox-bar", quantity: "3" },
      null,
      "glow-bar",
      { slug: "glow-bar", quantity: 1 },
    ],
    known,
  );
  assert.deepEqual(lines, [{ slug: "glow-bar", quantity: 3 }]);
});

test("sanitizeBasket returns an empty basket for anything that is not an array", () => {
  assert.deepEqual(sanitizeBasket({ slug: "glow-bar" }, known), []);
  assert.deepEqual(sanitizeBasket(undefined, known), []);
});

test("parseBasket survives missing and corrupt storage", () => {
  assert.deepEqual(parseBasket(null, known), []);
  assert.deepEqual(parseBasket("{not json", known), []);
  assert.deepEqual(parseBasket('[{"slug":"detox-bar","quantity":2}]', known), [
    { slug: "detox-bar", quantity: 2 },
  ]);
});

test("item count and label", () => {
  const lines = [
    { slug: "glow-bar", quantity: 2 },
    { slug: "detox-bar", quantity: 1 },
  ];
  assert.equal(basketItemCount(lines), 3);
  assert.equal(basketItemCount([]), 0);
  assert.equal(itemCountLabel(1), "1 item");
  assert.equal(itemCountLabel(3), "3 items");
  assert.equal(itemCountLabel(0), "0 items");
});

test("remainingQuantity is what still fits under the per-product limit", () => {
  const lines = [{ slug: "glow-bar", quantity: 18 }];
  assert.equal(remainingQuantity(lines, "glow-bar"), 2);
  assert.equal(remainingQuantity(lines, "other"), MAX_QUANTITY_PER_LINE);
  assert.equal(remainingQuantity([{ slug: "glow-bar", quantity: MAX_QUANTITY_PER_LINE }], "glow-bar"), 0);
});
