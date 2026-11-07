import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Link from "next/link";
import Chevron from "@/components/Chevron";
import Reveal from "@/components/Reveal";
import { line } from "@/lib/reveal";
import { INSTAGRAM_URL } from "@/lib/products";
import styles from "./contact.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Contact & ordering",
  description: "How to order Jaelush Beauty soaps and get in touch with us.",
  path: "/contact",
});

const steps = [
  {
    title: "Pick your products",
    text: "Browse the shop and choose the soaps and body butters your skin is asking for.",
  },
  {
    title: "Send us a DM",
    text: "Message @jaelushbeauty on Instagram with the products and quantities you would like.",
  },
  {
    title: "We confirm your order",
    text: "We reply with your total and arrange payment and delivery or pickup with you.",
  },
];

// TODO: replace the placeholders below with real details before launch.
const channels = [
  { label: "Instagram", value: "@jaelushbeauty", href: INSTAGRAM_URL },
  { label: "WhatsApp", value: "[Add WhatsApp number]" },
  { label: "Email", value: "[Add email address]" },
  { label: "Based in", value: "[Add city], Ghana" },
];

export default function ContactPage() {
  return (
    <>
      <section className={styles.hero}>
        <Reveal className="container">
          <p className={`eyebrow ${line(1)}`}>Contact &amp; ordering</p>
          <h1 className={line(2)}>
            Let&rsquo;s get you <em>glowing.</em>
          </h1>
          <p className={`${styles.lead} ${line(3)}`}>
            We take orders through Instagram for now. Send us a message and we&rsquo;ll help you
            find the right bar.
          </p>
          <div className={line(4)}>
            <a className="btn" href={INSTAGRAM_URL}>
              Order on Instagram
            </a>
          </div>
        </Reveal>
      </section>

      <section className="container">
        <h2 className={styles.h2}>How to order</h2>
        <Reveal as="ol" className={styles.steps}>
          {steps.map((s, i) => (
            <li key={s.title} className={line(i + 1)}>
              <span className={styles.stepNum}>{i + 1}</span>
              <h3>{s.title}</h3>
              <p className="muted">{s.text}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <section className="container">
        <Reveal className={styles.contact}>
          <div className={line(1)}>
            <h2 className={styles.h2}>Get in touch</h2>
            <p className="muted">
              Questions about an ingredient, a bar or a bulk order? We&rsquo;d love to hear from
              you.
            </p>
          </div>
          <dl className={`${styles.channels} ${line(2)}`}>
            {channels.map((c) => (
              <div key={c.label}>
                <dt>{c.label}</dt>
                <dd>
                  {c.href ? (
                    <a href={c.href}>
                      {c.value}
                    </a>
                  ) : (
                    c.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <p className={styles.back}>
          Not sure which bar to choose? <Link href="/shop/soaps" className="t-learn">
            Compare our soaps <Chevron />
          </Link>
        </p>
      </section>
    </>
  );
}
