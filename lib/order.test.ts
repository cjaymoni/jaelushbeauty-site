import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ORDER_FIELDS,
  ORDER_LIMITS,
  createOrderReference,
  customerOrderEmail,
  escapeHtml,
  shopOrderEmail,
  validateOrder,
  type Order,
} from "./order.ts";
import { products } from "./products.ts";

function form(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const valid = {
  [ORDER_FIELDS.name]: "Ama Mensah",
  [ORDER_FIELDS.phone]: "024 123 4567",
  [ORDER_FIELDS.email]: "Ama@Example.com",
  [ORDER_FIELDS.fulfilment]: "delivery",
  [ORDER_FIELDS.address]: "12 Palm Street, East Legon",
  [ORDER_FIELDS.notes]: "",
  [ORDER_FIELDS.items]: JSON.stringify([
    { slug: "glow-bar", quantity: 2 },
    { slug: "golden-essence-body-butter", quantity: 1 },
  ]),
};

test("a complete order is accepted, with names and links taken from the catalog", () => {
  const result = validateOrder(form(valid), products);
  assert.ok(result.ok);
  assert.equal(result.order.email, "ama@example.com");
  assert.equal(result.order.items.length, 2);
  assert.deepEqual(
    { name: result.order.items[0].name, quantity: result.order.items[0].quantity },
    { name: "Glow Bar", quantity: 2 },
  );
  assert.equal(result.order.items[0].url, "https://jaelushbeauty.com/shop/soaps/glow-bar");
});

test("missing details each get their own message", () => {
  const result = validateOrder(form({ [ORDER_FIELDS.items]: valid.items }), products);
  assert.ok(!result.ok && !("spam" in result));
  assert.deepEqual(Object.keys(result.fieldErrors).sort(), ["email", "fulfilment", "name", "phone"]);
});

test("delivery needs an address, pickup does not and drops any address sent", () => {
  const noAddress = validateOrder(form({ ...valid, [ORDER_FIELDS.address]: "  " }), products);
  assert.ok(!noAddress.ok && !("spam" in noAddress));
  assert.ok(noAddress.fieldErrors.address);

  const pickup = validateOrder(form({ ...valid, [ORDER_FIELDS.fulfilment]: "pickup" }), products);
  assert.ok(pickup.ok);
  assert.equal(pickup.order.address, "");
});

test("an unknown fulfilment option is rejected", () => {
  const result = validateOrder(form({ ...valid, [ORDER_FIELDS.fulfilment]: "drone" }), products);
  assert.ok(!result.ok && !("spam" in result));
  assert.ok(result.fieldErrors.fulfilment);
});

test("phone numbers accept local and international formats but not letters or short numbers", () => {
  for (const phone of ["0241234567", "+233 24 123 4567", "(024) 123-4567"]) {
    assert.ok(validateOrder(form({ ...valid, [ORDER_FIELDS.phone]: phone }), products).ok, phone);
  }
  for (const phone of ["12345", "call me", "024 123 4567 ext 9 9 9 9 9 9 9"]) {
    const r = validateOrder(form({ ...valid, [ORDER_FIELDS.phone]: phone }), products);
    assert.ok(!r.ok && !("spam" in r) && r.fieldErrors.phone, phone);
  }
});

test("bad emails are rejected", () => {
  for (const email of ["ama", "ama@", "ama@example", "a b@example.com"]) {
    const r = validateOrder(form({ ...valid, [ORDER_FIELDS.email]: email }), products);
    assert.ok(!r.ok && !("spam" in r) && r.fieldErrors.email, email);
  }
});

test("over-long notes are rejected", () => {
  const r = validateOrder(form({ ...valid, [ORDER_FIELDS.notes]: "x".repeat(ORDER_LIMITS.notesMax + 1) }), products);
  assert.ok(!r.ok && !("spam" in r) && r.fieldErrors.notes);
});

test("an empty, unknown-only or corrupt basket is rejected", () => {
  for (const items of ["[]", '[{"slug":"made-up","quantity":3}]', "{oops", ""]) {
    const r = validateOrder(form({ ...valid, [ORDER_FIELDS.items]: items }), products);
    assert.ok(!r.ok && !("spam" in r) && r.fieldErrors.items, items);
  }
});

test("line breaks are removed from one-line fields so they cannot spill into the subject", () => {
  const r = validateOrder(form({ ...valid, [ORDER_FIELDS.name]: "Ama\r\nMensah" }), products);
  assert.ok(r.ok);
  assert.equal(r.order.name, "Ama Mensah");
  assert.ok(!shopOrderEmail(r.order, "JB-0101-AAAA").subject.includes("\n"));
});

test("names accept accents, apostrophes, hyphens and initials", () => {
  for (const name of ["Akosua Asantewaa", "N’Dri Kouassi", "Mary-Jane O'Neil", "Kofi A. Boateng", "Zoë Éloïse"]) {
    assert.ok(validateOrder(form({ ...valid, [ORDER_FIELDS.name]: name }), products).ok, name);
  }
});

test("names that carry links, emails or digits are rejected, so they cannot be relayed in confirmation emails", () => {
  for (const name of ["Visit spam.com", "https://x.io", "win@prize.com", "Call 0241234567", "<b>Ama</b>"]) {
    const r = validateOrder(form({ ...valid, [ORDER_FIELDS.name]: name }), products);
    assert.ok(!r.ok && !("spam" in r) && r.fieldErrors.name, name);
  }
});

test("a filled-in honeypot marks the order as spam", () => {
  const r = validateOrder(form({ ...valid, [ORDER_FIELDS.honeypot]: "Acme Ltd" }), products);
  assert.deepEqual(r, { ok: false, spam: true });
});

test("order references use the date and an unambiguous code", () => {
  const ref = createOrderReference(new Date("2026-11-12T10:00:00Z"), (n) => new Uint8Array(n).fill(0));
  assert.equal(ref, "JB-1112-AAAA");
  const random = createOrderReference(new Date("2026-01-05T10:00:00Z"), (n) => crypto.getRandomValues(new Uint8Array(n)));
  assert.match(random, /^JB-0105-[A-HJ-NP-Z2-9]{4}$/);
});

test("order reference codes redraw bytes that would bias the alphabet", () => {
  // 248+ are rejected (256 is not a multiple of 31); 0, 1, 2, 30 map to A, B, C, 9.
  const draws = [Uint8Array.from([255, 0, 248, 1]), Uint8Array.from([2, 30, 0, 0])];
  const ref = createOrderReference(new Date("2026-11-12T10:00:00Z"), () => draws.shift() ?? new Uint8Array(4));
  assert.equal(ref, "JB-1112-ABC9");
});

test("a broken random source fails loudly instead of looping forever", () => {
  assert.throws(
    () => createOrderReference(new Date("2026-11-12T10:00:00Z"), (n) => new Uint8Array(n).fill(255)),
    /no usable bytes/,
  );
});

test("escapeHtml neutralises markup", () => {
  assert.equal(escapeHtml(`<img src=x onerror="alert('1')">&`), "&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt;&amp;");
});

// Built directly (not through validateOrder) to prove the email escapes HTML even if validation changes.
const order: Order = {
  name: "Ama <b>Mensah</b>",
  phone: "0241234567",
  email: "ama@example.com",
  fulfilment: "delivery",
  address: "12 Palm Street\nEast Legon",
  notes: "Gift wrap please",
  items: [{ slug: "glow-bar", name: "Glow Bar", variant: "Carrot & Turmeric", quantity: 2, url: "https://jaelushbeauty.com/shop/soaps/glow-bar" }],
};

test("the shop email lists every item and detail, with customer text escaped in HTML", () => {
  const email = shopOrderEmail(order, "JB-1112-K7QM");
  assert.match(email.subject, /JB-1112-K7QM/);
  assert.match(email.subject, /2 items/);
  for (const part of ["2 × Glow Bar (Carrot & Turmeric)", "0241234567", "East Legon", "Gift wrap please"]) {
    assert.ok(email.text.includes(part), part);
  }
  assert.ok(email.html.includes("Ama &lt;b&gt;Mensah&lt;/b&gt;"));
  assert.ok(!email.html.includes("<b>Mensah</b>"));
});

test("the customer email greets by first name and explains next steps for pickup", () => {
  const email = customerOrderEmail({ ...order, name: "Kofi Boateng", fulfilment: "pickup", address: "" }, "JB-1112-K7QM");
  assert.match(email.text, /^Hi Kofi,/);
  assert.match(email.text, /pickup time/);
  assert.match(email.subject, /JB-1112-K7QM/);
});
