import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { line } from "@/lib/reveal";
import SoapBar from "@/components/SoapBar";
import { INSTAGRAM_URL, products } from "@/lib/products";
import styles from "./about.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Our story",
  description:
    "Jaelush Beauty is a Ghanaian-owned skincare brand making handcrafted botanical soaps, body butters and skincare blends.",
  path: "/about",
});

const pillars = [
  {
    title: "Made for our climate",
    text: "Our formulations are designed with everyday life in mind, recognising the skincare needs of people living where heat, dust and changing weather can take a toll on the skin.",
  },
  {
    title: "Intentional ingredients",
    text: "From the richness of shea and cocoa butter to the goodness of botanical extracts and nourishing oils, every ingredient has a purpose.",
  },
  {
    title: "Small-batch craftsmanship",
    text: "We value quality, simplicity and small-batch craftsmanship, paying attention to the little details that make every product special.",
  },
  {
    title: "For everyone",
    text: "Good skincare should be accessible to both men and women, because everyone deserves to feel comfortable and confident in their skin.",
  },
];

export default function AboutPage() {
  const [glow, revive, detox, evenTone, purity] = products;

  return (
    <>
      <section className={styles.hero}>
        <Reveal className="container">
          <p className={`eyebrow ${line(1)}`}>Our story</p>
          <h1 className={line(2)}>
            Skincare that embraces <em>who you are.</em>
          </h1>
          <p className={`${styles.lead} ${line(3)}`}>
            Jaelush Beauty is a Ghanaian-owned skincare brand born out of a passion for natural
            beauty, thoughtful formulation and the belief that healthy-looking skin deserves
            intentional care.
          </p>
        </Reveal>
      </section>

      <Reveal as="section" className={`container ${styles.split}`}>
        <div className={line(1)}>
        <div className={styles.barStack} aria-hidden="true">
          {[glow, revive, detox, evenTone, purity].map((p) => (
            <SoapBar key={p.slug} product={p} />
          ))}
        </div>
        </div>
        <div className={line(2)}>
        <div className={styles.prose}>
          <p>
            We create handcrafted skincare products using carefully selected oils, butters,
            botanicals and nature-inspired ingredients to nourish, moisturise and care for the
            skin. Our collection includes handcrafted botanical soaps, luxurious body butters and
            unique skincare blends, all thoughtfully made to bring a little more goodness into your
            everyday skincare routine.
          </p>
          <blockquote className={styles.quote}>
            Skincare is not about changing who you are or altering your natural complexion. It is
            about embracing your skin, giving it the care it deserves and enhancing its natural
            beauty.
          </blockquote>
          <p>
            We are more than a skincare brand; we are a growing community of people who appreciate
            natural beauty, self-care and the confidence that comes with taking good care of
            themselves.
          </p>
        </div>
        </div>
      </Reveal>

      <section className={styles.pillarsSection}>
        <div className="container">
          <Reveal>
            <h2 className={line(1)}>What we believe</h2>
          </Reveal>
          <Reveal as="ul" className={styles.pillars}>
            {pillars.map((p, i) => (
              <li key={p.title} className={line(i + 1)}>
                <span className={styles.num}>0{i + 1}</span>
                <h3>{p.title}</h3>
                <p className="muted">{p.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="container">
        <Reveal className={styles.thanks}>
          <p className={`eyebrow ${line(1)}`}>To our Glowmates</p>
          <h2 className={line(2)}>Thank you for being part of our journey.</h2>
          <p className={line(3)}>
            Every purchase, recommendation and kind word inspires us to keep creating. Welcome to
            Jaelush Beauty.
          </p>
          <div className={line(4)}>
          <div className={styles.actions}>
            <Link href="/#bars" className="btn">
              Shop the bars
            </Link>
            <a className="btn btn-ghost-light" href={INSTAGRAM_URL}>
              Follow @jaelushbeauty
            </a>
          </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
