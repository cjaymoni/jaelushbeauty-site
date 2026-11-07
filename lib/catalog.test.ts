import { test } from "node:test";
import assert from "node:assert/strict";
import {
  categories,
  categoryPath,
  getCategory,
  getProductInCategory,
  isComingSoon,
  productCountLabel,
  productPath,
  productsInCategory,
} from "./catalog.ts";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { products } from "./products.ts";

test("every product belongs to a known category", () => {
  for (const p of products) {
    assert.ok(getCategory(p.category), `${p.slug} has unknown category "${p.category}"`);
  }
});

test("product and category slugs are unique", () => {
  const productSlugs = products.map((p) => p.slug);
  const categorySlugs = categories.map((c) => c.slug);
  assert.equal(new Set(productSlugs).size, productSlugs.length);
  assert.equal(new Set(categorySlugs).size, categorySlugs.length);
});

test("getCategory returns undefined for an unknown slug", () => {
  assert.equal(getCategory("candles"), undefined);
});

test("productsInCategory only returns products from that category", () => {
  const soaps = productsInCategory("soaps");
  assert.ok(soaps.length > 0);
  assert.ok(soaps.every((p) => p.category === "soaps"));
});

test("isComingSoon is true only for categories without products", () => {
  for (const c of categories) {
    assert.equal(isComingSoon(c), productsInCategory(c.slug).length === 0, c.slug);
  }
  assert.equal(isComingSoon(getCategory("soaps")!), false);
});

test("getProductInCategory rejects a product requested under the wrong category", () => {
  assert.equal(getProductInCategory("soaps", "glow-bar")?.slug, "glow-bar");
  assert.equal(getProductInCategory("body-butters", "glow-bar"), undefined);
  assert.equal(getProductInCategory("soaps", "no-such-bar"), undefined);
});

test("paths nest products under their category in the shop", () => {
  assert.equal(categoryPath({ slug: "soaps" }), "/shop/soaps");
  assert.equal(productPath({ slug: "glow-bar", category: "soaps" }), "/shop/soaps/glow-bar");
});

test("every product has at least one photo, and every photo file exists with alt text", () => {
  for (const p of products) {
    assert.ok(p.images.length > 0, `${p.slug} has no images`);
    for (const img of p.images) {
      assert.ok(existsSync(join("public", img.src)), `${p.slug}: missing file ${img.src}`);
      assert.ok(img.alt.trim().length > 0, `${p.slug}: ${img.src} has no alt text`);
    }
  }
});

test("category photos exist on disk", () => {
  for (const c of categories) {
    if (c.image) assert.ok(existsSync(join("public", c.image.src)), `${c.slug}: missing ${c.image.src}`);
  }
});

test("productCountLabel uses the singular only for one product", () => {
  assert.equal(productCountLabel(1), "1 product");
  assert.equal(productCountLabel(0), "0 products");
  assert.equal(productCountLabel(6), "6 products");
});

test("productCountLabel rejects counts that cannot be product totals", () => {
  assert.throws(() => productCountLabel(-1), RangeError);
  assert.throws(() => productCountLabel(1.5), RangeError);
  assert.throws(() => productCountLabel(Number.NaN), RangeError);
});
