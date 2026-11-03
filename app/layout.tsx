import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { DM_Sans, Fraunces } from "next/font/google";
import MobileMenu, { type NavLink } from "@/components/MobileMenu";
import {
  BRAND_COLOURS,
  INSTAGRAM_URL,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Ghana skincare",
    "handmade soap Ghana",
    "cold-process soap",
    "olive oil soap",
    "shea butter",
    "cocoa butter",
    "botanical skincare",
    "natural soap Accra",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: "/",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: BRAND_COLOURS.background,
};

// Cached so the year is fixed at build time rather than read on every render.
async function Year() {
  "use cache";
  return new Date().getFullYear();
}

const navLinks: NavLink[] = [
  { href: "/#bars", label: "Shop bars" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {/* Without JavaScript the reveal never runs, so show everything. */}
        <noscript>
          <style>{`.t-stagger-line{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="wordmark" aria-label="Jaelush Beauty home">
              Jaelush<span>Beauty</span>
            </Link>
            <nav aria-label="Main" className="desktop-nav">
              <ul>
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="header-actions">
              <a className="btn btn-small" href={INSTAGRAM_URL}>
                Order<span className="cta-extra"> on Instagram</span>
              </a>
              <MobileMenu links={navLinks} />
            </div>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="container footer-inner">
            <div>
              <p className="wordmark">
                Jaelush<span>Beauty</span>
              </p>
              <p className="muted">Handcrafted in Ghana, in small batches.</p>
            </div>
            <nav aria-label="Footer" className="footer-links">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <p className="muted">
              Follow us <a href={INSTAGRAM_URL}>@jaelushbeauty</a>
            </p>
            <p className="muted">
              © <Year /> Jaelush Beauty
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
