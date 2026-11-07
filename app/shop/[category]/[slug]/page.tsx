import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import ProductGallery from "@/components/ProductGallery";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import {
  SHOP_PATH,
  categoryPath,
  getCategory,
  getProductInCategory,
  productPath,
  productsInCategory,
} from "@/lib/catalog";
import { products } from "@/lib/products";
import { line } from "@/lib/reveal";
import { INSTAGRAM_URL, SITE_NAME, absoluteUrl, pageMetadata } from "@/lib/site";
import styles from "./product.module.css";

/** Most related products to show under a product. */
const RELATED_LIMIT = 4;

export function generateStaticParams() {
  return products.map((p) => ({ category: p.category, slug: p.slug }));
}

async function resolve(params: Promise<{ category: string; slug: string }>) {
  const { category: categorySlug, slug } = await params;
  const product = getProductInCategory(categorySlug, slug);
  const category = getCategory(categorySlug);
  return product && category ? { product, category } : undefined;
}

export async function generateMetadata(props: PageProps<"/shop/[category]/[slug]">): Promise<Metadata> {
  const found = await resolve(props.params);
  if (!found) return {};
  const { product } = found;
  return pageMetadata({
    title: `${product.name} — ${product.variant}`,
    description: `${product.tagline} ${product.whyChoose}`,
    path: productPath(product),
  });
}

export default async function ProductPage(props: PageProps<"/shop/[category]/[slug]">) {
  const found = await resolve(props.params);
  if (!found) notFound();
  const { product, category } = found;

  // Prefer more from the same category; fall back to the rest of the shop when it has no others.
  const sameCategory = productsInCategory(category.slug).filter((p) => p.slug !== product.slug);
  const others = (
    sameCategory.length > 0 ? sameCategory : products.filter((p) => p.slug !== product.slug)
  ).slice(0, RELATED_LIMIT);
  const othersTitle = sameCategory.length > 0 ? `More ${category.name.toLowerCase()}` : "You may also like";
  const othersLink = sameCategory.length > 0 ? categoryPath(category) : SHOP_PATH;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${product.variant}`,
    description: product.description,
    url: absoluteUrl(productPath(product)),
    image: product.images.map((img) => absoluteUrl(img.src)),
    brand: { "@type": "Brand", name: SITE_NAME },
    category: category.name,
  };

  return (
    // key: replay the reveals when moving from one product to another
    <div
      key={product.slug}
      style={{ "--tint": product.colour.tint, "--deep": product.colour.deep } as React.CSSProperties}
    >
      <JsonLd data={productJsonLd} />
      <section className={styles.hero}>
        <div className="container">
          <Breadcrumbs
            className={styles.crumbs}
            trail={[
              { label: "Home", href: "/" },
              { label: "Shop", href: SHOP_PATH },
              { label: category.name, href: categoryPath(category) },
              { label: product.name, href: productPath(product) },
            ]}
          />
        </div>
        <Reveal className={`container ${styles.heroInner}`}>
          <div className={line(1)}>
            <ProductGallery images={product.images} />
          </div>
          <div className={styles.info}>
            <p className={`${styles.variant} ${line(2)}`}>{product.variant}</p>
            <h1 className={line(2)}>{product.name}</h1>
            <p className={`${styles.tagline} ${line(3)}`}>{product.tagline}</p>
            <ul className={`${styles.highlights} ${line(3)}`} aria-label="Highlights">
              {product.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p className={`${styles.description} ${line(4)}`}>{product.description}</p>
            <div className={`${styles.actions} ${line(5)}`}>
              <a className="btn" href={INSTAGRAM_URL}>
                Order on Instagram
              </a>
              <Link href="/contact" className={styles.howTo}>
                How ordering works
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container">
        <Reveal className={styles.details}>
          <div className={line(1)}>
            <h2>{product.benefitsLabel}</h2>
            <dl className={styles.benefits}>
              {product.benefits.map((b) => (
                <div key={b.name}>
                  <dt>{b.name}</dt>
                  <dd>{b.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <aside className={`${styles.why} ${line(2)}`}>
            <h2>Why choose the {product.name}?</h2>
            <p>{product.whyChoose}</p>
          </aside>
        </Reveal>
      </section>

      {others.length > 0 && (
        <section className={`container ${styles.othersSection}`}>
          <div className={styles.othersHead}>
            <h2>{othersTitle}</h2>
            <Link href={othersLink} className={styles.viewAll}>
              View all
            </Link>
          </div>
          <ProductGrid products={others} />
        </section>
      )}
    </div>
  );
}
