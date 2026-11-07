import { test } from "node:test";
import assert from "node:assert/strict";
import { isActivePath } from "./nav.ts";

test("a link is active on its own page and its sub-pages", () => {
  assert.equal(isActivePath("/shop", "/shop"), true);
  assert.equal(isActivePath("/shop/soaps/glow-bar", "/shop"), true);
});

test("a link is not active on a page that only shares a prefix", () => {
  assert.equal(isActivePath("/shopping", "/shop"), false);
  assert.equal(isActivePath("/about", "/shop"), false);
});

test("the home link only matches the home page", () => {
  assert.equal(isActivePath("/", "/"), true);
  assert.equal(isActivePath("/shop", "/"), false);
});
