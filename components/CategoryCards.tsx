import Image from "next/image";
import Link from "next/link";
import CategoryArt from "@/components/CategoryArt";
import Chevron from "@/components/Chevron";
import Reveal from "@/components/Reveal";
import { categories, categoryPath, isComingSoon, productCountLabel, productsInCategory } from "@/lib/catalog";
import { line } from "@/lib/reveal";
import styles from "./CategoryCards.module.css";

/**
 * One card per shop category: its photo (or a drawing while it has none),
 * a product count or "Coming soon" label, and a link to the category.
 */
export default function CategoryCards({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <Reveal as="ul" className={styles.grid}>
      {categories.map((c, i) => {
        const soon = isComingSoon(c);
        const count = productsInCategory(c.slug).length;
        return (
          <li key={c.slug} className={line(i + 1)}>
            <Link
              href={categoryPath(c)}
              className={`t-learn ${styles.card}`}
              style={{ "--tint": c.colour.tint, "--deep": c.colour.deep } as React.CSSProperties}
            >
              <div className={styles.media}>
                {c.image ? (
                  <Image
                    src={c.image.src}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 380px"
                    className={styles.photo}
                    style={{ objectPosition: c.image.position }}
                  />
                ) : (
                  <CategoryArt category={c} className={styles.art} />
                )}
                <span className={styles.status}>
                  {soon ? "Coming soon" : productCountLabel(count)}
                </span>
              </div>
              <div className={styles.body}>
                <Heading className={styles.name}>{c.name}</Heading>
                <p className="muted">{c.summary}</p>
                <span className={styles.more}>
                  {soon ? "See what’s coming" : `Shop ${c.name.toLowerCase()}`} <Chevron />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </Reveal>
  );
}
