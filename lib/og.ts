import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

/**
 * Reads an image from /public as a data URL, for use inside ImageResponse
 * (which renders on the server and cannot fetch relative URLs). Cached so
 * share images can be generated once at build time.
 */
export async function loadPublicImage(src: string): Promise<string> {
  "use cache";
  const type = MIME_TYPES[extname(src).toLowerCase()];
  if (!type) throw new Error(`loadPublicImage: unsupported image type for "${src}"`);
  const data = await readFile(join(process.cwd(), "public", src));
  return `data:${type};base64,${data.toString("base64")}`;
}
