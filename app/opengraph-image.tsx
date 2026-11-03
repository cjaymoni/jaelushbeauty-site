import { ImageResponse } from "next/og";
import SocialCard, { SOCIAL_CARD_SIZE } from "@/components/SocialCard";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = SOCIAL_CARD_SIZE;
export const contentType = "image/png";

/** Default share image for every page that does not provide its own. */
export default function Image() {
  return new ImageResponse(
    (
      <SocialCard
        eyebrow="Handcrafted in Ghana"
        title="Care for the skin you're in."
        subtitle="Cold-process olive oil soaps with shea, cocoa butter and botanicals."
        bar={{ face: "#E9953A", side: "#9A4F14" }}
        tint="#FBEBD6"
      />
    ),
    size,
  );
}
