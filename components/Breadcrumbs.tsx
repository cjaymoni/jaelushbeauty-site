import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export type Crumb = { label: string; href: string };

/**
 * Trail of links back up the site (Home / Shop / Soap bars / …). The last
 * crumb is the current page. Also emits BreadcrumbList structured data so
 * search results can show the trail.
 */
export default function Breadcrumbs({ trail, className }: { trail: Crumb[]; className?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: absoluteUrl(c.href),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={`breadcrumbs ${className ?? ""}`}>
      <JsonLd data={jsonLd} />
      <ol>
        {trail.map((c, i) => {
          const isCurrent = i === trail.length - 1;
          return (
            <li key={c.href}>
              {isCurrent ? (
                <span aria-current="page">{c.label}</span>
              ) : (
                <Link href={c.href}>{c.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
