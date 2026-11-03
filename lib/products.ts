export type Benefit = { name: string; text: string };

export type Product = {
  slug: string;
  name: string; // e.g. "Glow Bar"
  variant: string; // e.g. "Carrot & Turmeric"
  tagline: string;
  description: string;
  benefitsLabel: string;
  benefits: Benefit[];
  whyChoose: string;
  /** Colours used for the bar illustration and accents. */
  colour: { bar: string; deep: string; speck?: string; tint: string };
};

export const products: Product[] = [
  {
    slug: "glow-bar",
    name: "Glow Bar",
    variant: "Carrot & Turmeric",
    tagline: "Radiance-boosting, evening and revitalising.",
    description:
      "Our carrot and turmeric olive bar reveals your natural glow with a powerful blend crafted to brighten and even out your complexion. Formulated with nutrient-rich carrot extract to deeply nourish, antioxidant-packed turmeric to soothe, and licorice root to gently fade dark spots. This powerhouse bar revives dull, tired skin, leaving it visibly luminous, balanced and beautifully refreshed.",
    benefitsLabel: "The botanical benefits",
    benefits: [
      {
        name: "Turmeric",
        text: "Rich in curcumin, known for its antioxidant properties. Helps support a healthy-looking complexion.",
      },
      {
        name: "Carrot",
        text: "Contains naturally occurring carotenoids and antioxidants that help protect against oxidative stress.",
      },
      {
        name: "Olive oil",
        text: "Rich in fatty acids and antioxidants, helping give the skin a soft, comfortable feel.",
      },
    ],
    whyChoose:
      "Choose the Glow Bar if your skin looks dull, tired or lacks radiance. It is a lovely addition to a routine focused on a fresh, healthy-looking glow.",
    colour: { bar: "#E9953A", deep: "#9A4F14", speck: "#F6C46A", tint: "#FBEBD6" },
  },
  {
    slug: "revive-bar",
    name: "Revive Bar",
    variant: "Coffee & Clove",
    tagline: "Energises, gently exfoliates and refreshes skin.",
    description:
      "Wake up your skin and your senses with this aromatic, skin-smoothing treat. Real coffee grounds offer a natural, invigorating exfoliation to sweep away dead skin cells and boost circulation, while clove brings a warm, comforting scent. It is the perfect morning bar for soft, energised skin from head to toe.",
    benefitsLabel: "The botanical benefits",
    benefits: [
      {
        name: "Coffee",
        text: "Provides gentle physical exfoliation to help remove surface dead skin cells and leave skin feeling smoother.",
      },
      {
        name: "Clove",
        text: "Contains eugenol and other antioxidant compounds, valued for their antioxidant properties.",
      },
    ],
    whyChoose:
      "Choose Coffee & Clove if you enjoy exfoliating soaps and want to improve the feel and appearance of rough, uneven skin texture. Particularly lovely for those who enjoy a refreshing bath-time experience.",
    colour: { bar: "#8A5A3B", deep: "#4E2F1D", speck: "#2B180E", tint: "#EFE2D6" },
  },
  {
    slug: "detox-bar",
    name: "Detox Bar",
    variant: "Activated Charcoal & Kaolin Clay",
    tagline: "Deep-cleansing, detoxifying and pore-refining.",
    description:
      "Hit the reset button on your skin with a deeply cleansing, pore-purifying wash. Activated charcoal acts like a magnet, pulling stubborn dirt and impurities from your pores. Meanwhile, creamy kaolin clay gently absorbs excess oil and polishes the skin’s surface without causing dryness. The result is a smooth, matte finish and balanced-feeling skin.",
    benefitsLabel: "The ingredient benefits",
    benefits: [
      {
        name: "Activated charcoal",
        text: "Its porous structure allows it to adsorb certain substances on the skin’s surface, making it a popular ingredient in cleansing products.",
      },
      {
        name: "Kaolin clay",
        text: "A gentle mineral clay that helps absorb excess surface oil and leaves the skin feeling fresh and clean.",
      },
    ],
    whyChoose:
      "Choose this bar if you experience excess oil, prefer a thorough cleansing sensation or want to remove everyday surface buildup.",
    colour: { bar: "#3A3634", deep: "#1C1A19", speck: "#6B6560", tint: "#E7E3DF" },
  },
  {
    slug: "even-tone-bar",
    name: "Even Tone Bar",
    variant: "Licorice",
    tagline: "Brightening, soothing and gentle.",
    description:
      "Experience the pure, skin-loving benefits of licorice root in its truest form. Known as nature’s gentle brightener, this bar is dedicated to fading the look of hyperpigmentation, calming redness and restoring a uniform-looking complexion. Highly soothing and packed with antioxidants, it is an excellent choice for sensitive skin seeking a brighter, calmer glow.",
    benefitsLabel: "The botanical benefits",
    benefits: [
      {
        name: "Licorice root",
        text: "Contains glabridin and other compounds studied for their ability to influence melanin production. Valued in skincare for helping improve the appearance of uneven skin tone.",
      },
      { name: "Brighter look", text: "Helps support a brighter, more even-looking complexion." },
      { name: "Antioxidants", text: "Offers antioxidant benefits." },
    ],
    whyChoose:
      "Choose Licorice if you are concerned about the appearance of dark spots, uneven-looking skin tone or dullness and want a cleansing bar that complements your complexion-care routine.",
    colour: { bar: "#C9A27A", deep: "#7A5434", speck: "#E8CFAE", tint: "#F5EBDD" },
  },
  {
    slug: "purity-bar",
    name: "Purity Bar",
    variant: "Neem",
    tagline: "Clarifying, purifying and soothing.",
    description:
      "Calm, clear and comfort troubled-looking skin with nature’s defence team. Time-honoured neem oil soothes and helps target the look of blemishes. Paired with licorice root to help fade post-breakout marks and even skin tone, this gentle yet effective bar purifies without stripping away essential moisture.",
    benefitsLabel: "The botanical benefits",
    benefits: [
      {
        name: "Neem",
        text: "Contains naturally occurring compounds with antioxidant and antimicrobial activity demonstrated in various studies.",
      },
      { name: "Tradition", text: "Traditionally valued in skincare formulations for its cleansing properties." },
      {
        name: "Comfort",
        text: "Complements routines for skin that is prone to feeling uncomfortable or looking blemish-prone.",
      },
    ],
    whyChoose:
      "Choose Neem if you appreciate traditional botanical skincare and want a refreshing cleansing bar as part of your daily routine.",
    colour: { bar: "#7E8F55", deep: "#4A5A2C", speck: "#B6C28A", tint: "#E9ECDC" },
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export { INSTAGRAM_URL } from "./site";
