import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CategoryCards from "@/components/CategoryCards";
import Chevron from "@/components/Chevron";
import JsonLd from "@/components/JsonLd";
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
import { line } from "@/lib/reveal";
import { INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import styles from "./page.module.css";

const values = [
  { title: "Cold-process olive oil", text: "Every bar is slow-cured for a gentle, creamy lather." },
  { title: "Shea & cocoa butter", text: "Rich West African butters that nourish and moisturise." },
  { title: "Small-batch, by hand", text: "Made in small runs so every detail gets attention." },
  { title: "For everyone", text: "Made for men and women, and all skin types and complexions." },
];

/** Ingredients listed on the Golden Essence packaging, shown in the spotlight. */
const goldenEssenceIngredients = [
  "Shea butter",
  "Mango butter",
  "Carrot oil",
  "Rosehip oil",
  "Coconut oil",
  "Almond oil",
  "Vitamin E",
];

/** How many soaps to feature on the home page; the rest live in the shop. */
const FEATURED_COUNT = 4;

// Title, description and share card come from the root layout.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Tells search engines who the brand is and links its social profile. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  sameAs: [INSTAGRAM_URL],
  address: { "@type": "PostalAddress", addressCountry: "GH" },
};

export default function Home() {
  const soaps = getCategory("soaps")!;
  const featured = productsInCategory(soaps.slug).slice(0, FEATURED_COUNT);
  const goldenEssence = getProductInCategory("body-butters", "golden-essence-body-butter")!;
  const lifestyle = goldenEssence.images[1] ?? goldenEssence.images[0];
  const purity = getProductInCategory("soaps", "purity-bar")!;
  const storyPhoto = purity.images[1] ?? purity.images[0];

  return (
    <>
      <JsonLd data={organizationJsonLd} />

      {/* Hero */}
      <section className={styles.hero}>
        <Reveal className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={`eyebrow ${line(1)}`}>Naturally crafted. Beautifully you.</p>
            <h1 className={line(2)}>
              Care for the skin <em>you&rsquo;re in.</em>
            </h1>
            <p className={`${styles.lead} ${line(3)}`}>
              Handcrafted olive oil soaps and body butters, made in small batches in Ghana with
              shea, cocoa butter and nature&rsquo;s finest botanicals. Not to change who you are,
              but to help your skin look and feel its best.
            </p>
            <div className={line(4)}>
              <div className={styles.actions}>
                <Link href={SHOP_PATH} className="btn">
                  Visit the shop
                </Link>
                <Link href="/about" className="btn btn-ghost">
                  Our story
                </Link>
              </div>
            </div>
          </div>
          <div className={`${styles.heroMedia} ${line(3)}`}>
            {soaps.image && (
              <div className={styles.heroPhoto}>
                <Image
                  src={soaps.image.src}
                  alt={soaps.image.alt}
                  fill
                  preload
                  sizes="(max-width: 900px) 100vw, 580px"
                  className={styles.cover}
                />
              </div>
            )}
            <Link href={productPath(goldenEssence)} className={styles.newChip}>
              <span className={styles.newThumb}>
                <Image
                  src={goldenEssence.images[0].src}
                  alt=""
                  fill
                  sizes="56px"
                  className={styles.cover}
                />
              </span>
              <span>
                <span className={styles.newLabel}>New</span>
                <span className={styles.newName}>{goldenEssence.name}</span>
              </span>
              <Chevron />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Values */}
      <section className={styles.values} aria-label="What makes Jaelush different">
        <Reveal as="ul" className={`container ${styles.valuesGrid}`}>
          {values.map((v, i) => (
            <li key={v.title} className={line(i + 1)}>
              <p className={styles.valueTitle}>{v.title}</p>
              <p className="muted">{v.text}</p>
            </li>
          ))}
        </Reveal>
      </section>

      {/* Categories */}
      <section className={styles.section} aria-labelledby="categories-heading">
        <div className="container">
          <Reveal className={styles.sectionHead}>
            <div>
              <p className={`eyebrow ${line(1)}`}>The shop</p>
              <h2 id="categories-heading" className={line(2)}>
                Shop by category
              </h2>
            </div>
            <div className={line(3)}>
              <Link href={SHOP_PATH} className={`t-learn ${styles.readMore}`}>
                Browse the shop <Chevron />
              </Link>
            </div>
          </Reveal>
          <CategoryCards />
        </div>
      </section>

      {/* New product spotlight */}
      <section className={styles.section} aria-labelledby="spotlight-heading">
        <div className="container">
          <Reveal className={styles.spotlight}>
            <div className={`${styles.spotlightPhoto} ${line(1)}`}>
              <Image
                src={lifestyle.src}
                alt={lifestyle.alt}
                fill
                sizes="(max-width: 900px) 100vw, 520px"
                className={styles.cover}
                style={{ objectPosition: lifestyle.position }}
              />
            </div>
            <div className={styles.spotlightCopy}>
              <p className={`eyebrow ${line(1)}`}>New · You asked, we listened</p>
              <h2 id="spotlight-heading" className={line(2)}>
                {goldenEssence.name}
              </h2>
              <p className={`${styles.spotlightTagline} ${line(3)}`}>{goldenEssence.tagline}</p>
              <div className={line(4)}>
                <p className={styles.madeWith}>Made with</p>
                <ul className={styles.ingredients}>
                  {goldenEssenceIngredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </div>
              <div className={line(5)}>
                <div className={styles.actions}>
                  <Link href={productPath(goldenEssence)} className="btn btn-gold">
                    Shop Golden Essence
                  </Link>
                  <a className="btn btn-ghost-light" href={INSTAGRAM_URL}>
                    Order on Instagram
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured soaps */}
      <section className={styles.section} aria-labelledby="featured-heading">
        <div className="container">
          <Reveal className={styles.sectionHead}>
            <div>
              <p className={`eyebrow ${line(1)}`}>The soap collection</p>
              <h2 id="featured-heading" className={line(2)}>
                A bar for every ritual
              </h2>
              <p className={`muted ${line(3)}`}>{soaps.intro}</p>
            </div>
            <div className={line(4)}>
              <Link href={categoryPath(soaps)} className={`t-learn ${styles.readMore}`}>
                All soaps <Chevron />
              </Link>
            </div>
          </Reveal>
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* Story */}
      <section className={`${styles.section} ${styles.story}`}>
        <Reveal className={`container ${styles.storyInner}`}>
          <div className={`${styles.storyPhoto} ${line(1)}`}>
            <Image
              src={storyPhoto.src}
              alt={storyPhoto.alt}
              fill
              sizes="(max-width: 900px) 100vw, 460px"
              className={styles.cover}
            />
          </div>
          <div className={`${styles.storyText} ${line(2)}`}>
            <p className="eyebrow">About us</p>
            <h2>Born from a love of natural beauty</h2>
            <p>
              Jaelush Beauty is a Ghanaian-owned skincare brand born out of a passion for natural
              beauty, thoughtful formulation and the belief that healthy-looking skin deserves
              intentional care.
            </p>
            <p>
              Our formulations are designed with everyday life in mind, for people living where
              heat, dust and changing weather can take a toll on the skin. From the richness of
              shea and cocoa butter to botanical extracts and nourishing oils, every ingredient
              has a purpose.
            </p>
            <Link href="/about" className={`${styles.readMore} t-learn`}>
              Read our full story <Chevron />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Glowmates */}
      <section className={styles.section}>
        <div className="container">
          <Reveal className={styles.glowmates}>
            <p className={`eyebrow ${line(1)}`}>Our community</p>
            <h2 className={line(2)}>Hello, Glowmates.</h2>
            <p className={line(3)}>
              To our amazing customers, thank you for being part of our journey. Every purchase,
              recommendation and kind word inspires us to keep creating.
            </p>
            <div className={line(4)}>
              <a className="btn" href={INSTAGRAM_URL}>
                Join us on Instagram
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
