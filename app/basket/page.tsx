import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Checkout, { type BasketProduct } from "@/components/Checkout";
import ProductGrid from "@/components/ProductGrid";
import { BASKET_PATH } from "@/lib/basket";
import { productPath } from "@/lib/catalog";
import { products } from "@/lib/products";
import { pageMetadata } from "@/lib/site";
import styles from "./basket.module.css";

/** Products suggested when the basket is empty. */
const SUGGESTION_LIMIT = 4;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Your basket",
    description: "Review your Jaelush Beauty basket and send your order request.",
    path: BASKET_PATH,
  }),
  // A basket is personal; there is nothing here for search engines.
  robots: { index: false, follow: true },
};

const basketProducts: BasketProduct[] = products.map((p) => ({
  slug: p.slug,
  name: p.name,
  variant: p.variant,
  href: productPath(p),
  image: { src: p.images[0].src, position: p.images[0].position },
  tint: p.colour.tint,
}));

export default function BasketPage() {
  return (
    <>
      <header className={styles.header}>
        <div className="container">
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Basket", href: BASKET_PATH },
            ]}
          />
          <p className="eyebrow">Your order</p>
          <h1>Review &amp; send</h1>
        </div>
      </header>
      <div className={`container ${styles.body}`}>
        <Checkout
          products={basketProducts}
          suggestions={<ProductGrid products={products.slice(0, SUGGESTION_LIMIT)} />}
        />
      </div>
    </>
  );
}
