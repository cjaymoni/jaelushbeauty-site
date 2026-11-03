import type { Product } from "@/lib/products";

// Small deterministic random so specks look the same on server and client.
function seeded(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export default function SoapBar({
  product,
  className,
  decorative = false,
}: {
  product: Product;
  className?: string;
  /** Hide from screen readers when nearby text already names the bar (e.g. inside a card link). */
  decorative?: boolean;
}) {
  const { bar, deep, speck } = product.colour;
  const rand = seeded(product.slug);
  const id = `bar-${product.slug}`;
  const specks = speck
    ? Array.from({ length: 70 }, () => ({
        x: 34 + rand() * 252,
        y: 34 + rand() * 152,
        r: 0.8 + rand() * 1.8,
        o: 0.35 + rand() * 0.5,
      }))
    : [];

  return (
    <svg
      viewBox="0 0 320 240"
      className={className}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": `${product.name}, ${product.variant} soap bar` })}
    >
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bar} />
          <stop offset="1" stopColor={deep} stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`${id}-shine`} cx="0.3" cy="0.25" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="24" y="24" width="272" height="172" rx="34" />
        </clipPath>
      </defs>

      {/* shadow and side */}
      <ellipse cx="160" cy="220" rx="130" ry="10" fill="#3B2418" opacity="0.12" />
      <rect x="24" y="36" width="272" height="172" rx="34" fill={deep} />
      {/* face */}
      <rect x="24" y="24" width="272" height="172" rx="34" fill={bar} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="24" y="24" width="272" height="172" fill={`url(#${id}-face)`} />
        {specks.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={speck} opacity={s.o} />
        ))}
        <rect x="24" y="24" width="272" height="172" fill={`url(#${id}-shine)`} />
      </g>
      {/* stamp */}
      <rect
        x="70"
        y="78"
        width="180"
        height="64"
        rx="32"
        fill="none"
        stroke={deep}
        strokeOpacity="0.45"
        strokeWidth="2"
      />
      <text
        x="160"
        y="118"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontSize="26"
        letterSpacing="5"
        fill={deep}
        fillOpacity="0.55"
      >
        JAELUSH
      </text>
    </svg>
  );
}
