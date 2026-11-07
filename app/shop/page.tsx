import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategoryCards from "@/components/CategoryCards";
import CategoryTabs from "@/components/CategoryTabs";
import Chevron from "@/components/Chevron";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import { SHOP_PATH, categories, categoryPath, isComingSoon, productsInCategory } from "@/lib/catalog";
import { line } from "@/lib/reveal";
import { pageMetadata } from "@/lib/site";
import styles from "./shop.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Shop",
  description:
    "Shop Jaelush Beauty's handcrafted olive oil soap bars, Mosaic Confetti Soap Mix and Golden Essence Body Butter, with botanical blends coming soon.",
  path: SHOP_PATH,
});

export default function ShopPage() {
  const liveCategories = categories.filter((c) => !isComingSoon(c));

  return (
    <>
      <header className={styles.header}>
        <div className="container">
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Shop", href: SHOP_PATH },
            ]}
          />
          <Reveal>
            <p className={`eyebrow ${line(1)}`}>The shop</p>
            <h1 className={line(2)}>Botanical care for every ritual</h1>
            <p className={`${styles.lead} ${line(3)}`}>
              Everything we make, in one place. Each product is handcrafted in small batches in
              Ghana with olive oil, shea, mango and cocoa butter, and botanicals.
            </p>
            <div className={line(4)}>
              <CategoryTabs current="all" />
            </div>
          </Reveal>
        </div>
      </header>

      <section className={`container ${styles.section}`} aria-labelledby="by-category">
        <div className={styles.sectionHead}>
          <h2 id="by-category">Shop by category</h2>
        </div>
        <CategoryCards />
      </section>

      {liveCategories.map((c) => (
        <section key={c.slug} className={`container ${styles.section}`} aria-labelledby={`cat-${c.slug}`}>
          <div className={styles.sectionHead}>
            <div>
              <h2 id={`cat-${c.slug}`}>{c.name}</h2>
              <p className="muted">{c.summary}</p>
            </div>
            <Link href={categoryPath(c)} className={`t-learn ${styles.viewAll}`}>
              View all {c.name.toLowerCase()} <Chevron />
            </Link>
          </div>
          <ProductGrid products={productsInCategory(c.slug)} />
        </section>
      ))}

      <section className="container">
        <div className={styles.ordering}>
          <div>
            <h2>How ordering works</h2>
            <p className="muted">
              Pick your products, send us a message on Instagram, and we&rsquo;ll arrange payment
              and delivery or pickup with you.
            </p>
          </div>
          <Link href="/contact" className="btn btn-ghost">
            Ordering details
          </Link>
        </div>
      </section>
    </>
  );
}
