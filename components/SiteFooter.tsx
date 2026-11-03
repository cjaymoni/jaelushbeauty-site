import Link from "next/link";
import type { NavLink } from "@/components/MobileMenu";
import { products } from "@/lib/products";
import { INSTAGRAM_URL } from "@/lib/site";

// Cached so the year is fixed at build time rather than read on every render.
async function Year() {
  "use cache";
  return new Date().getFullYear();
}

export default function SiteFooter({ links }: { links: NavLink[] }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="wordmark" aria-label="Jaelush Beauty home">
              Jaelush<span>Beauty</span>
            </Link>
            <p className="muted">
              Handcrafted botanical skincare, made in small batches in Ghana with olive oil, shea
              and cocoa butter.
            </p>
            <a className="btn btn-ghost btn-small" href={INSTAGRAM_URL}>
              Follow @jaelushbeauty
            </a>
          </div>

          <nav aria-labelledby="footer-bars" className="footer-col">
            <h2 id="footer-bars" className="footer-heading">
              The bars
            </h2>
            <ul>
              {products.map((p) => (
                <li key={p.slug}>
                  <Link href={`/bars/${p.slug}`}>{p.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-explore" className="footer-col">
            <h2 id="footer-explore" className="footer-heading">
              Explore
            </h2>
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col">
            <h2 className="footer-heading">Ordering</h2>
            <p className="muted">
              We take orders by direct message on Instagram and arrange delivery or pickup with you.
            </p>
            <Link href="/contact" className="footer-text-link">
              How to order
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © <Year /> Jaelush Beauty. All rights reserved.
          </p>
          <p>Made with care in Ghana.</p>
        </div>
      </div>
    </footer>
  );
}
