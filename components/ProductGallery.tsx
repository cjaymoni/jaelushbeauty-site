"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/products";
import styles from "./ProductGallery.module.css";

/** Main photo sized for the product page's two-column hero (one column on tablets and phones). */
const MAIN_IMAGE_SIZES = "(max-width: 900px) 100vw, 560px";

/**
 * Product photos: one large image and, when there is more than one photo,
 * a row of thumbnail buttons that switch it.
 */
export default function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          preload={active === 0}
          sizes={MAIN_IMAGE_SIZES}
          className={styles.mainPhoto}
          style={{ objectPosition: current.position }}
        />
      </div>
      {images.length > 1 && (
        <ul className={styles.thumbs} aria-label="Product photos">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                className={styles.thumb}
                aria-pressed={i === active}
                aria-label={`Show photo ${i + 1} of ${images.length}: ${img.alt}`}
                onClick={() => setActive(i)}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover", objectPosition: img.position }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
