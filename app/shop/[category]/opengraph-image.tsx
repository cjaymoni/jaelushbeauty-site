import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import SocialCard, { SOCIAL_CARD_SIZE } from "@/components/SocialCard";
import { categories, getCategory, isComingSoon } from "@/lib/catalog";
import { loadPublicImage } from "@/lib/og";

export const alt = "Jaelush Beauty shop category";
export const size = SOCIAL_CARD_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

/** Share image for a shop category, in the category's colours. */
export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  return new ImageResponse(
    (
      <SocialCard
        eyebrow={isComingSoon(category) ? "Coming soon" : "Shop"}
        title={category.name}
        subtitle={category.summary}
        photo={category.image ? await loadPublicImage(category.image.src) : undefined}
        tint={category.colour.tint}
      />
    ),
    size,
  );
}
