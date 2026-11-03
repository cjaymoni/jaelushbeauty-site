import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import SocialCard, { SOCIAL_CARD_SIZE } from "@/components/SocialCard";
import { getProduct, products } from "@/lib/products";

export const alt = "Jaelush Beauty soap bar";
export const size = SOCIAL_CARD_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

/** Share image for a single bar, drawn in that bar's colours. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return new ImageResponse(
    (
      <SocialCard
        eyebrow={product.variant}
        title={product.name}
        subtitle={product.tagline}
        bar={{ face: product.colour.bar, side: product.colour.deep }}
        tint={product.colour.tint}
      />
    ),
    size,
  );
}
