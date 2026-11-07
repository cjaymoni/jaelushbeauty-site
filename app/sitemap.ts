import type { MetadataRoute } from "next";
import { SHOP_PATH, categories, categoryPath, isComingSoon, productPath } from "@/lib/catalog";
import { products } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl(SHOP_PATH), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
  ];
  // "Coming soon" categories are left out until they have products (they are also noindex).
  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((c) => !isComingSoon(c))
    .map((c) => ({ url: absoluteUrl(categoryPath(c)), changeFrequency: "weekly", priority: 0.8 }));
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(productPath(p)),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [...pages, ...categoryPages, ...productPages];
}
