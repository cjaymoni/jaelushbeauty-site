import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
  ];
  const bars: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(`/bars/${p.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [...pages, ...bars];
}
