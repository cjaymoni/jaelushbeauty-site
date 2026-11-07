"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, type NavLink } from "@/lib/nav";

/** Desktop navigation. Marks the current section with aria-current so it can be styled. */
export default function HeaderNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="desktop-nav">
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} aria-current={isActivePath(pathname, l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
