import type { Category } from "@/lib/catalog";

/**
 * Simple illustration for a shop category: stacked soap bars, a butter jar
 * or a dropper bottle, drawn in the category's colours. Always decorative,
 * since the category name sits next to it.
 */
export default function CategoryArt({ category, className }: { category: Category; className?: string }) {
  const { tint, deep, accent } = category.colour;

  return (
    <svg viewBox="0 0 240 180" className={className} aria-hidden="true">
      <ellipse cx="120" cy="164" rx="80" ry="7" fill="#3B2418" opacity="0.1" />
      {category.slug === "soaps" && (
        <g>
          <rect x="44" y="104" width="152" height="54" rx="18" fill={deep} />
          <rect x="44" y="96" width="152" height="52" rx="18" fill={accent} />
          <rect x="62" y="58" width="128" height="46" rx="16" fill={deep} opacity="0.85" />
          <rect x="62" y="50" width="128" height="46" rx="16" fill={tint} stroke={deep} strokeOpacity="0.25" />
          <rect x="74" y="60" width="44" height="10" rx="5" fill="#fff" opacity="0.5" />
        </g>
      )}
      {category.slug === "body-butters" && (
        <g>
          <rect x="62" y="84" width="116" height="74" rx="18" fill={accent} />
          <rect x="62" y="84" width="116" height="20" fill={deep} opacity="0.15" />
          <rect x="56" y="58" width="128" height="32" rx="12" fill={deep} />
          <path d="M92 58c4-14 20-22 28-10 6-10 24-6 26 10z" fill={tint} />
          <rect x="84" y="114" width="72" height="26" rx="6" fill={tint} opacity="0.9" />
        </g>
      )}
      {category.slug === "botanical-blends" && (
        <g>
          <rect x="88" y="76" width="64" height="82" rx="16" fill={accent} />
          <rect x="88" y="104" width="64" height="54" rx="16" fill={deep} opacity="0.35" />
          <rect x="106" y="56" width="28" height="22" rx="4" fill={deep} />
          <rect x="112" y="20" width="16" height="40" rx="8" fill={tint} stroke={deep} strokeOpacity="0.4" />
          <path d="M170 132c18-6 30-24 26-46-22 4-34 22-26 46z" fill={deep} opacity="0.7" />
          <path d="M70 140c-16-4-26-20-22-38 18 4 28 18 22 38z" fill={deep} opacity="0.5" />
        </g>
      )}
    </svg>
  );
}
