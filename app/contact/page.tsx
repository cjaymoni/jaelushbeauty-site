import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Link from "next/link";
import Chevron from "@/components/Chevron";
import Reveal from "@/components/Reveal";
import { line } from "@/lib/reveal";
import { SHOP_PATH } from "@/lib/catalog";
import { INSTAGRAM_URL } from "@/lib/site";
import styles from "./contact.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Contact & ordering",
  description: "How to order Jaelush Beauty soaps and get in touch with us.",
  path: "/contact",
});

const steps = [
  {
    title: "Fill your basket",
    text: "Browse the shop and add the soaps and body butters your skin is asking for.",
  },
  {
    title: "Send your order",
    text: "Add your name, phone and email, choose delivery or pickup, and send. No payment is taken online.",
  },
  {
    title: "We confirm it",
    text: "We email or call you with your total, then arrange payment and delivery or pickup.",
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
            Order straight from the site in about a minute. Prefer to chat first? Message us on
            Instagram and we&rsquo;ll help you find the right bar.
          </p>
          <div className={`${styles.heroActions} ${line(4)}`}>
            <Link className="btn" href={SHOP_PATH}>
              Start shopping
            </Link>
            <a className="btn btn-ghost" href={INSTAGRAM_URL}>
              Message on Instagram
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
