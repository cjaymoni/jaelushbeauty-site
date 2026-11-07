import { products, type Product, type ProductImage } from "./products.ts";

export const SHOP_PATH = "/shop";

export type CategorySlug = "soaps" | "body-butters" | "botanical-blends";

export type Category = {
  slug: CategorySlug;
  name: string;
  /** One line for cards and menus. */
  summary: string;
  /** Longer intro shown at the top of the category page. */
  intro: string;
  /** Accent colours for the category's card, page header and share image. */
  colour: { tint: string; deep: string; accent: string };
  /** Photo for the category card and page header. Without one, a drawn illustration is used. */
  image?: ProductImage;
};

/** Shop categories, in display order. A category with no products shows as "coming soon". */
export const categories: Category[] = [
  {
    slug: "soaps",
    name: "Soaps",
    summary: "Olive oil soap bars and confetti mixes, each with its own botanical blend.",
    intro:
      "Handcrafted in small batches with olive oil and a purposeful blend of botanicals for a gentle, creamy lather. Choose a bar for what your skin is asking for, or try a little of everything with our confetti mix.",
    colour: { tint: "#FBEBD6", deep: "#9A4F14", accent: "#E9953A" },
    image: {
      src: "/images/site/soap-collection.jpg",
      alt: "The five Jaelush Beauty soap bars in their sleeves on marble with flowers",
      width: 1080,
      height: 734,
    },
  },
  {
    slug: "body-butters",
    name: "Body butters",
    summary: "Whipped shea and mango butter blends for soft, glowing skin.",
    intro:
      "Whipped with shea and mango butter and nourishing botanical oils for deep, lasting moisture, made for heat, dust and changing weather.",
    colour: { tint: "#F8EDCF", deep: "#8A6414", accent: "#E3B341" },
    image: {
      src: "/images/products/golden-essence-body-butter-1.jpg",
      alt: "An open jar of whipped Golden Essence Body Butter above stacked gold-lidded jars",
      width: 810,
      height: 1080,
    },
  },
  {
    slug: "botanical-blends",
    name: "Botanical blends",
    summary: "Nourishing oils and botanical extracts for everyday care.",
    intro:
      "Nourishing oils and botanical extracts, blended in small batches with the same care as our soaps.",
    colour: { tint: "#E8EBD9", deep: "#56622F", accent: "#9AA65E" },
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function productsInCategory(slug: CategorySlug): Product[] {
  return products.filter((p) => p.category === slug);
}

/** True when a category has no products yet and should show its "coming soon" page. */
export function isComingSoon(category: Category): boolean {
  return productsInCategory(category.slug).length === 0;
}

/** Finds a product only when it belongs to the given category, so mismatched URLs 404. */
export function getProductInCategory(categorySlug: string, productSlug: string): Product | undefined {
  return products.find((p) => p.slug === productSlug && p.category === categorySlug);
}

const productPlurals = new Intl.PluralRules("en");
const productNouns: Partial<Record<Intl.LDMLPluralRule, string>> = { one: "product", other: "products" };

/** "1 product", "6 products". Uses the locale's plural rules rather than a hand-written check. */
export function productCountLabel(count: number): string {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`productCountLabel: expected a whole number of products, got ${count}`);
  }
  const noun = productNouns[productPlurals.select(count)] ?? productNouns.other;
  return `${count} ${noun}`;
}

export function categoryPath(category: Pick<Category, "slug">): string {
  return `${SHOP_PATH}/${category.slug}`;
}

export function productPath(product: Pick<Product, "slug" | "category">): string {
  return `${SHOP_PATH}/${product.category}/${product.slug}`;
}
