import type { Metadata } from "next";

/** Public origin of the live site. Used for canonical URLs, the sitemap and social cards. */
export const SITE_URL = "https://jaelushbeauty.com";
export const SITE_NAME = "Jaelush Beauty";
export const SITE_TAGLINE = "Handcrafted botanical skincare from Ghana";
export const SITE_DESCRIPTION =
  "Ghanaian-owned skincare brand making cold-process olive oil soaps, body butters and botanical blends with shea, cocoa butter and nature's finest ingredients.";
export const SITE_LOCALE = "en_GH";
export const INSTAGRAM_URL = "https://www.instagram.com/jaelushbeauty/";

/** Brand colours shared by the social card images and the web manifest. */
export const BRAND_COLOURS = {
  background: "#f7f0e5",
  text: "#3b2418",
  textSoft: "#6e5546",
  accent: "#a8492a",
} as const;

type PageMetadataInput = {
  title: string;
  description: string;
  /** Path from the site root, starting with "/". */
  path: string;
};

/**
 * Builds a page's metadata with a canonical URL and matching Open Graph and
 * Twitter fields. Next.js replaces (rather than merges) a parent's `openGraph`
 * object, so every page sets the shared fields here to keep them consistent.
 * Share images come from the nearest `opengraph-image` file.
 */
export function pageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  if (!path.startsWith("/")) {
    throw new Error(`pageMetadata: path must start with "/", got "${path}"`);
  }
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      url: path,
      title: `${title} · ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
    },
  };
}

/** Absolute URL for a site path, e.g. for the sitemap and structured data. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Serialises structured data for a `<script type="application/ld+json">` tag.
 * `<` is escaped so a value containing `</script>` cannot break out of the tag.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
