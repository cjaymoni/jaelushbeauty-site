import { BRAND_COLOURS } from "@/lib/site";

/** Size for Open Graph / Twitter share images (the 1.91:1 size most platforms expect). */
export const SOCIAL_CARD_SIZE = { width: 1200, height: 630 };

/** Width of the photo panel on the right of the card. */
const PHOTO_WIDTH = 480;

type SocialCardProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Photo for the right-hand panel, as a data URL (see loadPublicImage). */
  photo?: string;
  /** Panel colour, shown behind the photo or on its own when there is none. */
  tint: string;
};

/**
 * Layout for generated share images. Rendered by `ImageResponse`, which
 * supports only a subset of CSS (flexbox, no grid), so every element with
 * more than one child sets `display: flex`.
 */
export default function SocialCard({ eyebrow, title, subtitle, photo, tint }: SocialCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: BRAND_COLOURS.background,
        color: BRAND_COLOURS.text,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 64px 64px 80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
          Jaelush<span style={{ color: BRAND_COLOURS.accent, marginLeft: 8 }}>Beauty</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 24,
              textTransform: "uppercase",
              letterSpacing: 3,
              color: BRAND_COLOURS.accent,
              marginBottom: 20,
            }}
          >
            {eyebrow}
          </div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5 }}>
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: BRAND_COLOURS.textSoft,
              marginTop: 24,
              maxWidth: 560,
            }}
          >
            {subtitle}
          </div>
        </div>
        <div style={{ fontSize: 24, color: BRAND_COLOURS.textSoft }}>jaelushbeauty.com</div>
      </div>
      <div
        style={{
          width: PHOTO_WIDTH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: tint,
        }}
      >
        {photo && (
          // ImageResponse needs a plain <img>; next/image does not work here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={PHOTO_WIDTH}
            height={SOCIAL_CARD_SIZE.height}
            style={{ width: PHOTO_WIDTH, height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
    </div>
  );
}
