export type NavLink = { href: string; label: string };

/**
 * Whether a nav link points at the current page or one of its sub-pages,
 * e.g. "Shop" stays highlighted on /shop/soaps/glow-bar.
 * The home link only matches the home page itself.
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
