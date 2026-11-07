import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import SocialCard, { SOCIAL_CARD_SIZE } from "@/components/SocialCard";
import { getProductInCategory } from "@/lib/catalog";
import { loadPublicImage } from "@/lib/og";
import { products } from "@/lib/products";

export const alt = "Jaelush Beauty product";
export const size = SOCIAL_CARD_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return products.map((p) => ({ category: p.category, slug: p.slug }));
}

/** Share image for a single product, drawn in that product's colours. */
export default async function Image({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = getProductInCategory(category, slug);
  if (!product) notFound();

  return new ImageResponse(
    (
      <SocialCard
        eyebrow={product.variant}
        title={product.name}
        subtitle={product.tagline}
        photo={await loadPublicImage(product.images[0].src)}
        tint={product.colour.tint}
      />
    ),
    size,
  );
}
