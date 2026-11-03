import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { line } from "@/lib/reveal";
import SoapBar from "@/components/SoapBar";
import TiltCard from "@/components/TiltCard";
import { INSTAGRAM_URL, getProduct, products } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, absoluteUrl, pageMetadata } from "@/lib/site";
import styles from "./bar.module.css";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/bars/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return {};
  return pageMetadata({
    title: `${product.name} — ${product.variant}`,
    description: `${product.tagline} ${product.whyChoose}`,
    path: `/bars/${product.slug}`,
  });
}

export default async function BarPage(props: PageProps<"/bars/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const others = products.filter((p) => p.slug !== product.slug);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${product.variant}`,
    description: product.description,
    url: absoluteUrl(`/bars/${product.slug}`),
    image: absoluteUrl(`/bars/${product.slug}/opengraph-image`),
    brand: { "@type": "Brand", name: SITE_NAME },
    category: "Soap",
  };

  return (
    // key: replay the reveals when moving from one bar to another
    <div
      key={product.slug}
      style={{ "--tint": product.colour.tint, "--deep": product.colour.deep } as React.CSSProperties}
    >
      <JsonLd data={productJsonLd} />
      <section className={styles.hero}>
        <Reveal className={`container ${styles.heroInner}`}>
          <div className={`${styles.art} ${line(1)}`}>
            <SoapBar product={product} />
          </div>
          <div>
            <div className={line(1)}>
              <Link href="/#bars" className={styles.back}>
                <span aria-hidden="true">←</span> All bars
              </Link>
            </div>
            <p className={`${styles.variant} ${line(2)}`}>{product.variant}</p>
            <h1 className={line(2)}>{product.name}</h1>
            <p className={`${styles.tagline} ${line(3)}`}>{product.tagline}</p>
            <p className={`${styles.description} ${line(4)}`}>{product.description}</p>
            <div className={line(5)}>
              <a className="btn" href={INSTAGRAM_URL}>
                Order on Instagram
              </a>
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
            <h2>Why choose this bar?</h2>
            <p>{product.whyChoose}</p>
          </aside>
        </Reveal>
      </section>

      <section className={`container ${styles.othersSection}`}>
        <h2>Explore the other bars</h2>
        <Reveal as="ul" className={styles.others}>
          {others.map((p, i) => (
            <li key={p.slug} className={line(i + 1)}>
              <TiltCard className={styles.tilt}>
                <Link href={`/bars/${p.slug}`} className={`t-tilt-card ${styles.other}`}>
                    <SoapBar product={p} decorative />
                    <span className={styles.otherName}>{p.name}</span>
                    <span className={`muted ${styles.otherVariant}`}>{p.variant}</span>
                    <span className="t-tilt-glare" />
                  </Link>
              </TiltCard>
            </li>
          ))}
        </Reveal>
      </section>
    </div>
  );
}
