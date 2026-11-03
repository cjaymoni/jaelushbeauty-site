import { test } from "node:test";
import assert from "node:assert/strict";
import { SITE_NAME, absoluteUrl, pageMetadata, serializeJsonLd } from "./site.ts";

test("pageMetadata sets a canonical URL and matching social fields", () => {
  const meta = pageMetadata({ title: "Our story", description: "About us.", path: "/about" });

  assert.equal(meta.title, "Our story");
  assert.deepEqual(meta.alternates, { canonical: "/about" });
  assert.equal(meta.openGraph?.url, "/about");
  assert.equal(meta.openGraph?.title, `Our story · ${SITE_NAME}`);
  assert.equal(meta.openGraph?.description, "About us.");
  assert.equal(meta.twitter?.title, `Our story · ${SITE_NAME}`);
});

test("pageMetadata rejects a path without a leading slash", () => {
  assert.throws(
    () => pageMetadata({ title: "x", description: "y", path: "about" }),
    /must start with "\/", got "about"/,
  );
});

test("absoluteUrl joins paths onto the live domain", () => {
  assert.equal(absoluteUrl("/"), "https://jaelushbeauty.com/");
  assert.equal(absoluteUrl("/bars/glow-bar"), "https://jaelushbeauty.com/bars/glow-bar");
});

test("serializeJsonLd escapes < so data cannot close the script tag", () => {
  const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

  assert.ok(!out.includes("<"));
  assert.deepEqual(JSON.parse(out), { name: "</script><script>alert(1)</script>" });
});
