import { BRAND_COLOURS } from "@/lib/site";

/** Size for Open Graph / Twitter share images (the 1.91:1 size most platforms expect). */
export const SOCIAL_CARD_SIZE = { width: 1200, height: 630 };

type SocialCardProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Soap bar colours drawn on the right of the card. */
  bar: { face: string; side: string };
  /** Background tint behind the bar. */
  tint: string;
};

/**
 * Layout for generated share images. Rendered by `ImageResponse`, which
 * supports only a subset of CSS (flexbox, no grid), so every element with
 * more than one child sets `display: flex`.
 */
export default function SocialCard({ eyebrow, title, subtitle, bar, tint }: SocialCardProps) {
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
          width: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: tint,
        }}
      >
        {/* A simple soap bar: darker side slab with the lighter face on top. */}
        <div style={{ display: "flex", position: "relative", width: 280, height: 200 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 18,
              width: 280,
              height: 182,
              borderRadius: 40,
              background: bar.side,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 280,
              height: 182,
              borderRadius: 40,
              background: `linear-gradient(135deg, ${bar.face}, ${bar.side})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
