import { ImageResponse } from "next/og";
import SocialCard, { SOCIAL_CARD_SIZE } from "@/components/SocialCard";
import { getCategory } from "@/lib/catalog";
import { loadPublicImage } from "@/lib/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = SOCIAL_CARD_SIZE;
export const contentType = "image/png";

/** Default share image for every page that does not provide its own. */
export default async function Image() {
  const collection = getCategory("soaps")?.image;
  const photo = collection ? await loadPublicImage(collection.src) : undefined;
  return new ImageResponse(
    (
      <SocialCard
        eyebrow="Naturally crafted. Beautifully you."
        title="Care for the skin you're in."
        subtitle="Handcrafted olive oil soaps and body butters, made in small batches in Ghana."
        photo={photo}
        tint="#FBEBD6"
      />
    ),
    size,
  );
}
