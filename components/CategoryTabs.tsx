import Link from "next/link";
import { SHOP_PATH, categories, categoryPath, isComingSoon } from "@/lib/catalog";

/**
 * Pill links for moving between shop categories. `current` is the active
 * category slug, or "all" on the main shop page.
 */
export default function CategoryTabs({ current }: { current: string }) {
  const tabs = [
    { key: "all", label: "All products", href: SHOP_PATH, soon: false },
    ...categories.map((c) => ({
      key: c.slug,
      label: c.name,
      href: categoryPath(c),
      soon: isComingSoon(c),
    })),
  ];

  return (
    <nav aria-label="Shop categories" className="category-tabs">
      <ul>
        {tabs.map((t) => (
          <li key={t.key}>
            <Link href={t.href} aria-current={t.key === current ? "page" : undefined}>
              {t.label}
              {t.soon && <span className="soon-tag">Soon</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
