import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategoryArt from "@/components/CategoryArt";
import CategoryTabs from "@/components/CategoryTabs";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import {
  SHOP_PATH,
  categories,
  categoryPath,
  getCategory,
  isComingSoon,
  productCountLabel,
  productsInCategory,
} from "@/lib/catalog";
import { line } from "@/lib/reveal";
import { INSTAGRAM_URL, pageMetadata } from "@/lib/site";
import styles from "../shop.module.css";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(props: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category: slug } = await props.params;
  const category = getCategory(slug);
  if (!category) return {};
  const soon = isComingSoon(category);
  return {
    ...pageMetadata({
      title: soon ? `${category.name} — coming soon` : category.name,
      description: category.intro,
      path: categoryPath(category),
    }),
    // Keep empty "coming soon" pages out of search results until they have products.
    ...(soon && { robots: { index: false, follow: true } }),
  };
}

export default async function CategoryPage(props: PageProps<"/shop/[category]">) {
  const { category: slug } = await props.params;
  const category = getCategory(slug);
  if (!category) notFound();

  const items = productsInCategory(category.slug);
  const firstLiveCategory = categories.find((c) => !isComingSoon(c));

  return (
    <div
      key={category.slug}
      style={{ "--tint": category.colour.tint } as React.CSSProperties}
    >
      <header className={styles.header}>
        <div className="container">
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Shop", href: SHOP_PATH },
              { label: category.name, href: categoryPath(category) },
            ]}
          />
          <Reveal className={category.image ? styles.headerSplit : undefined}>
            <div>
              <p className={`eyebrow ${line(1)}`}>The shop</p>
              <h1 className={line(2)}>{category.name}</h1>
              <p className={`${styles.lead} ${line(3)}`}>{category.intro}</p>
              <div className={line(4)}>
                <CategoryTabs current={category.slug} />
              </div>
            </div>
            {category.image && (
              <div className={`${styles.headerPhoto} ${line(2)}`}>
                <Image
                  src={category.image.src}
                  alt={category.image.alt}
                  fill
                  preload
                  sizes="(max-width: 900px) 100vw, 480px"
                  style={{ objectFit: "cover", objectPosition: category.image.position }}
                />
              </div>
            )}
          </Reveal>
        </div>
      </header>

      <section className="container">
        {items.length > 0 ? (
          <div className={styles.section}>
            <h2 className="sr-only">
              {productCountLabel(items.length)}
            </h2>
            <ProductGrid products={items} />
          </div>
        ) : (
          <Reveal className={styles.soon}>
            <div className={line(1)}>
              <CategoryArt category={category} className={styles.soonArt} />
            </div>
            <div>
              <p className={`eyebrow ${line(1)}`}>Coming soon</p>
              <h2 className={line(2)}>Our {category.name.toLowerCase()} are on the way.</h2>
              <p className={line(3)}>
                We&rsquo;re putting the finishing touches on them now. Follow us on Instagram to
                hear first when they launch.
              </p>
              <div className={line(4)}>
                <div className={styles.actions}>
                  <a className="btn" href={INSTAGRAM_URL}>
                    Follow @jaelushbeauty
                  </a>
                  {firstLiveCategory && (
                    <Link href={categoryPath(firstLiveCategory)} className="btn btn-ghost">
                      Shop {firstLiveCategory.name.toLowerCase()}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </section>
    </div>
  );
}
