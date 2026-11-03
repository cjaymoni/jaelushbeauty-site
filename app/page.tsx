import Link from "next/link";
import Chevron from "@/components/Chevron";
import Reveal from "@/components/Reveal";
import { line } from "@/lib/reveal";
import SoapBar from "@/components/SoapBar";
import TiltCard from "@/components/TiltCard";
import { INSTAGRAM_URL, products } from "@/lib/products";
import styles from "./page.module.css";

const values = [
  { title: "Cold-process olive oil", text: "Every bar is slow-cured for a gentle, creamy lather." },
  { title: "Shea & cocoa butter", text: "Rich West African butters that nourish and moisturise." },
  { title: "Small-batch, by hand", text: "Made in small runs so every detail gets attention." },
  { title: "For everyone", text: "Made for men and women, and all skin types and complexions." },
];

export default function Home() {
  const [glow, revive, detox, evenTone, purity] = products;

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <Reveal className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={`eyebrow ${line(1)}`}>Handcrafted botanical skincare · Ghana</p>
            <h1 className={line(2)}>
              Care for the skin <em>you&rsquo;re in.</em>
            </h1>
            <p className={`${styles.lead} ${line(3)}`}>
              Olive oil soaps, body butters and botanical blends made with shea, cocoa butter and
              nature&rsquo;s finest ingredients. Not to change who you are, but to help your skin
              look and feel its best.
            </p>
            <div className={line(4)}>
              <div className={styles.actions}>
                <Link href="#bars" className="btn">
                  Shop the bars
                </Link>
                <Link href="#story" className="btn btn-ghost">
                  Our story
                </Link>
              </div>
            </div>
          </div>
          <div className={line(3)}>
            <div className={styles.heroArt} aria-hidden="true">
              <SoapBar product={glow} className={`${styles.float} ${styles.f1}`} />
              <SoapBar product={revive} className={`${styles.float} ${styles.f2}`} />
              <SoapBar product={purity} className={`${styles.float} ${styles.f3}`} />
            </div>
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

      {/* Bars */}
      <section id="bars" className={styles.section}>
        <div className="container">
          <Reveal className={styles.sectionHead}>
            <p className={`eyebrow ${line(1)}`}>The soap collection</p>
            <h2 className={line(2)}>Five bars, five rituals</h2>
            <p className={`muted ${line(3)}`}>
              Each bar is made with olive oil and a purposeful blend of botanicals. Find the one
              your skin is asking for.
            </p>
          </Reveal>
          <Reveal as="ul" className={styles.barGrid}>
            {[glow, revive, detox, evenTone, purity].map((p, i) => (
              <li key={p.slug} className={line(i + 1)}>
                <TiltCard className={styles.tilt}>
                  <Link
                      href={`/bars/${p.slug}`}
                      className={`t-tilt-card ${styles.barCard} t-learn`}
                      style={{ "--tint": p.colour.tint, "--deep": p.colour.deep } as React.CSSProperties}
                    >
                      <SoapBar product={p} className={styles.cardArt} decorative />
                      <span className={styles.variant}>{p.variant}</span>
                      <h3>{p.name}</h3>
                      <p className="muted">{p.tagline}</p>
                      <span className={styles.more}>
                        Discover <Chevron />
                      </span>
                      <span className="t-tilt-glare" />
                    </Link>
                </TiltCard>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section id="story" className={`${styles.section} ${styles.story}`}>
        <Reveal className={`container ${styles.storyInner}`}>
          <div className={line(1)}>
            <p className="eyebrow">About us</p>
            <h2>Born from a love of natural beauty</h2>
          </div>
          <div className={`${styles.storyText} ${line(2)}`}>
            <p>
              Jaelush Beauty is a Ghanaian-owned skincare brand born out of a passion for natural
              beauty, thoughtful formulation and the belief that healthy-looking skin deserves
              intentional care.
            </p>
            <p>
              We believe skincare is not about changing who you are or altering your natural
              complexion. It is about embracing your skin, giving it the care it deserves and
              enhancing its natural beauty.
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
      <section id="glowmates" className={styles.section}>
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
