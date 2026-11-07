import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPublicImage } from "./og.ts";

test("loadPublicImage returns a JPEG data URL for a photo in /public", async () => {
  const url = await loadPublicImage("/images/products/glow-bar-1.jpg");
  assert.match(url, /^data:image\/jpeg;base64,\/9j\//);
});

test("loadPublicImage rejects unsupported file types with the path in the message", async () => {
  await assert.rejects(loadPublicImage("/icon.svg"), /unsupported image type for "\/icon\.svg"/);
});

test("loadPublicImage rejects a missing file", async () => {
  await assert.rejects(loadPublicImage("/images/products/no-such-photo.jpg"), /ENOENT/);
});
