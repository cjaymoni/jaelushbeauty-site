import Image from "next/image";
import Link from "next/link";
import Chevron from "@/components/Chevron";
import Reveal from "@/components/Reveal";
import { productPath } from "@/lib/catalog";
import type { Product } from "@/lib/products";
import { line } from "@/lib/reveal";
import styles from "./ProductGrid.module.css";

/** Matches the grid below: one column on phones, two on tablets, then ~300px cards. */
const CARD_IMAGE_SIZES = "(max-width: 560px) 100vw, (max-width: 900px) 50vw, 320px";

/** Grid of product cards, each with the product's main photo, linking to its page. */
export default function ProductGrid({
  products,
  headingLevel = "h3",
}: {
  products: Product[];
  /** Heading level for each card's name, so it fits the page's outline. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <Reveal as="ul" className={styles.grid}>
      {products.map((p, i) => {
        const photo = p.images[0];
        return (
          <li key={p.slug} className={line(i + 1)}>
            <Link
              href={productPath(p)}
              className={`t-learn ${styles.card}`}
              style={{ "--tint": p.colour.tint, "--deep": p.colour.deep } as React.CSSProperties}
            >
              <div className={styles.frame}>
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes={CARD_IMAGE_SIZES}
                  className={styles.photo}
                  style={{ objectPosition: photo.position }}
                />
              </div>
              <Heading className={styles.name}>{p.name}</Heading>
              <span className={styles.variant}>{p.variant}</span>
              <p className="muted">{p.tagline}</p>
              <span className={styles.more}>
                Discover <Chevron />
              </span>
            </Link>
          </li>
        );
      })}
    </Reveal>
  );
}
