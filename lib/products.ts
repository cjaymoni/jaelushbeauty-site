import type { CategorySlug } from "./catalog.ts";

export type Benefit = { name: string; text: string };

/** A photo in /public. Width and height are the file's real pixel size. */
export type ProductImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position used when the photo is cropped to fit a frame. */
  position?: string;
};

export type Product = {
  slug: string;
  category: CategorySlug;
  name: string; // e.g. "Glow Bar"
  variant: string; // e.g. "Carrot & Turmeric"
  tagline: string;
  description: string;
  benefitsLabel: string;
  benefits: Benefit[];
  whyChoose: string;
  /** Short claims from the packaging, e.g. "Brightens". */
  highlights: string[];
  /** Product photos. The first one is used on cards and share images. */
  images: ProductImage[];
  /** Background tint and a deeper accent that reads on it. */
  colour: { deep: string; tint: string };
};

export const products: Product[] = [
  {
    slug: "glow-bar",
    category: "soaps",
    highlights: ["Brightens", "Evens tone", "Revitalises", "Face & body"],
    images: [
      { src: "/images/products/glow-bar-1.jpg", alt: "Three Glow Bars stacked with carrot slices, turmeric root and white flowers", width: 864, height: 1080 },
      { src: "/images/products/glow-bar-2.jpg", alt: "Glow Bar in its sleeve on a bamboo soap dish beside a white loofah", width: 1080, height: 641, position: "20% 50%" },
      { src: "/images/products/glow-bar-3.jpg", alt: "Stacked Glow Bars beside a miniature shopping cart holding another bar", width: 1080, height: 583, position: "45% 50%" },
    ],
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
    colour: { deep: "#9A4F14", tint: "#FBEBD6" },
  },
  {
    slug: "revive-bar",
    category: "soaps",
    highlights: ["Energises", "Exfoliates", "Refreshes", "Face & body"],
    images: [
      { src: "/images/products/revive-bar-1.jpg", alt: "Revive Bar on a bamboo soap dish with a lathered bar and a white loofah", width: 720, height: 1080 },
      { src: "/images/products/revive-bar-2.jpg", alt: "Stacked Revive Bars in front of a bonsai tree", width: 864, height: 1080 },
    ],
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
    colour: { deep: "#4E2F1D", tint: "#EFE2D6" },
  },
  {
    slug: "detox-bar",
    category: "soaps",
    highlights: ["Detoxifies", "Deep cleanses", "Purifies", "Face & body"],
    images: [
      { src: "/images/products/detox-bar-1.jpg", alt: "Detox Bar on a bamboo soap dish with a lathered bar and a white loofah", width: 720, height: 1080 },
      { src: "/images/products/detox-bar-2.jpg", alt: "Stacked Detox Bars in front of a bonsai tree", width: 864, height: 1080 },
      { src: "/images/products/detox-bar-3.jpg", alt: "Stacked Detox Bars beside a miniature shopping cart", width: 1080, height: 719, position: "25% 50%" },
      { src: "/images/products/detox-bar-4.jpg", alt: "A single Detox Bar in its sleeve on marble", width: 720, height: 1080 },
    ],
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
    colour: { deep: "#1C1A19", tint: "#E7E3DF" },
  },
  {
    slug: "even-tone-bar",
    category: "soaps",
    highlights: ["Brightens", "Evens tone", "Soothes", "Face & body"],
    images: [
      { src: "/images/products/even-tone-bar-1.jpg", alt: "Even Tone Bar on a bamboo soap dish beside a white loofah", width: 720, height: 1080 },
      { src: "/images/products/even-tone-bar-2.jpg", alt: "Stacked Even Tone Bars surrounded by white flowers", width: 720, height: 1080 },
    ],
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
    colour: { deep: "#7A5434", tint: "#F5EBDD" },
  },
  {
    slug: "purity-bar",
    category: "soaps",
    highlights: ["Clarifies", "Purifies", "Soothes", "Face & body"],
    images: [
      { src: "/images/products/purity-bar-1.jpg", alt: "Purity Bar on a bamboo soap dish beside a white loofah", width: 720, height: 1080 },
      { src: "/images/products/purity-bar-2.jpg", alt: "Stacked Purity Bars in front of fresh neem leaves", width: 900, height: 1080 },
    ],
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
    colour: { deep: "#4A5A2C", tint: "#E9ECDC" },
  },
  {
    slug: "mosaic-confetti-soap-mix",
    category: "soaps",
    highlights: ["All skin types", "Face & body"],
    images: [
      { src: "/images/products/mosaic-confetti-soap-mix-1.jpg", alt: "Open tub of Mosaic Confetti Soap Mix filled with colourful soap pieces", width: 810, height: 1080 },
      { src: "/images/products/mosaic-confetti-soap-mix-2.jpg", alt: "A hand holding a tub of Mosaic Confetti Soap Mix", width: 810, height: 1080 },
      { src: "/images/products/mosaic-confetti-soap-mix-3.jpg", alt: "Close-up of orange, black, brown and cream confetti soap pieces", width: 810, height: 1080 },
    ],
    name: "Mosaic Confetti Soap Mix",
    variant: "Face & body soap mix",
    tagline: "A colourful mix of handcrafted soap pieces in one tub.",
    description:
      "A little of everything we love. Our Mosaic Confetti Soap Mix brings together colourful pieces of handcrafted botanical soap in one tub, a playful way to enjoy a mix of textures, colours and botanicals at bath time. Suitable for all skin types, on face and body.",
    benefitsLabel: "What makes it special",
    benefits: [
      {
        name: "Botanical variety",
        text: "Colourful pieces of handcrafted soap, so every wash feels a little different.",
      },
      { name: "Face & body", text: "Made to be used on both face and body." },
      { name: "All skin types", text: "A gentle everyday mix suitable for every skin type." },
    ],
    whyChoose:
      "Choose the Mosaic Confetti Soap Mix if you love variety, want to try a little of everything, or are looking for a cheerful gift.",
    colour: { deep: "#5B4636", tint: "#EFE6DA" },
  },
  {
    slug: "golden-essence-body-butter",
    category: "body-butters",
    highlights: [
      "Deep moisture",
      "Nourishes & softens",
      "Supports natural glow",
      "Helps protect skin barrier",
      "All skin types",
    ],
    images: [
      { src: "/images/products/golden-essence-body-butter-1.jpg", alt: "An open jar of whipped Golden Essence Body Butter above stacked gold-lidded jars", width: 810, height: 1080 },
      { src: "/images/products/golden-essence-body-butter-2.jpg", alt: "A woman smoothing Golden Essence Body Butter onto her shoulder while holding the jar", width: 810, height: 1080, position: "50% 35%" },
    ],
    name: "Golden Essence Body Butter",
    variant: "Shea & Mango Butter",
    tagline: "Rich botanical goodness for radiant, healthy-looking skin.",
    description:
      "You asked, we listened. Our luscious whipped body butter pairs shea and mango butter for deep moisture with carrot, rosehip, coconut and almond oils and vitamin E to nourish and soften. It melts into the skin, leaving it comfortable, supple and glowing. Your daily dose of botanical luxury.",
    benefitsLabel: "What it is made with",
    benefits: [
      { name: "Shea butter", text: "A rich West African butter that helps moisturise and soften dry-feeling skin." },
      { name: "Mango butter", text: "A smooth, creamy butter that helps lock in moisture." },
      {
        name: "Carrot & rosehip oils",
        text: "Naturally rich in carotenoids and fatty acids that support a healthy-looking glow.",
      },
      { name: "Coconut & almond oils", text: "Nourishing oils that leave skin feeling soft and supple." },
      { name: "Vitamin E", text: "An antioxidant that helps support the skin's natural moisture barrier." },
    ],
    whyChoose:
      "Choose Golden Essence if your skin often feels dry or tight, or you want a rich daily moisturiser that leaves skin soft with a natural glow. Suitable for all skin types.",
    colour: { deep: "#8A6414", tint: "#F8EDCF" },
  },
];

export { INSTAGRAM_URL } from "./site.ts";
