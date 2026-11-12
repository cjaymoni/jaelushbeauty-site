"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitOrder } from "@/app/basket/actions";
import { itemCountLabel, type BasketLine } from "@/lib/basket";
import { SHOP_PATH } from "@/lib/catalog";
import {
  FULFILMENT_LABELS,
  FULFILMENT_OPTIONS,
  ORDER_FIELDS,
  ORDER_LIMITS,
  type FieldErrors,
  type Fulfilment,
  type OrderField,
} from "@/lib/order";
import type { OrderState } from "@/lib/order-email";
import { INSTAGRAM_URL } from "@/lib/site";
import { useBasket } from "./BasketProvider";
import { BagIcon } from "./icons";
import QuantityStepper from "./QuantityStepper";
import styles from "./Checkout.module.css";

/** The few product details the basket needs, picked on the server so the full catalog isn't sent. */
export type BasketProduct = {
  slug: string;
  name: string;
  variant: string;
  href: string;
  image: { src: string; position?: string };
  tint: string;
};

const FULFILMENT_HINTS: Record<Fulfilment, string> = {
  delivery: "We’ll arrange delivery to your door.",
  pickup: "Collect from us. We’ll share where and when.",
};

/** Field order for moving focus to the first problem after a failed submit. */
const FIELD_ORDER: OrderField[] = ["name", "phone", "email", "fulfilment", "address", "notes"];

type Details = { name: string; phone: string; email: string; fulfilment: Fulfilment; address: string; notes: string };
const EMPTY_DETAILS: Details = { name: "", phone: "", email: "", fulfilment: "delivery", address: "", notes: "" };

/** Basket review, customer details form and confirmation, all on /basket. */
export default function Checkout({ products, suggestions }: { products: BasketProduct[]; suggestions: React.ReactNode }) {
  const { lines, count, ready, clear } = useBasket();
  const [state, formAction, pending] = useActionState<OrderState, FormData>(submitOrder, { status: "idle" });
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  // Errors from the last submit; a field's error clears as soon as it is edited.
  const [errors, setErrors] = useState<FieldErrors>({});
  // What was in the basket when the order was sent, for the confirmation.
  const submitted = useRef<BasketLine[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLHeadingElement>(null);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  useEffect(() => {
    if (state.status === "invalid") {
      setErrors(state.fieldErrors);
      const first = FIELD_ORDER.find((f) => state.fieldErrors[f]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${ORDER_FIELDS[first]}"]`)?.focus();
    } else if (state.status === "sent") {
      clear();
      setDetails(EMPTY_DETAILS);
      window.scrollTo({ top: 0 });
      confirmationRef.current?.focus();
    }
  }, [state, clear]);

  const update = (field: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDetails((d) => ({ ...d, [field]: value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  if (state.status === "sent") {
    return <Confirmation state={state} lines={submitted.current} bySlug={bySlug} headingRef={confirmationRef} />;
  }

  if (!ready) {
    return (
      <div className={styles.loading} aria-busy="true">
        <p className="muted">Loading your basket…</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon} aria-hidden="true">
          <BagIcon size={32} strokeWidth={1.6} />
        </div>
        <h2>Your basket is empty</h2>
        <p className="muted">Add a soap bar or body butter and it will wait for you here, even if you leave the site.</p>
        <Link href={SHOP_PATH} className="btn">
          Browse the shop
        </Link>
        <div className={styles.suggestions}>
          <h2 className={styles.suggestionsHeading}>Customer favourites</h2>
          {suggestions}
        </div>
      </div>
    );
  }

  const hasErrors = Object.values(errors).some(Boolean);
  const errorId = (f: OrderField) => `${f}-error`;
  const describedBy = (f: OrderField, hint?: string) =>
    [errors[f] ? errorId(f) : undefined, hint].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.layout}>
      <BasketLines products={bySlug} itemsError={errors.items} />

      <section aria-labelledby="details-heading" className={styles.formPanel}>
        <form
          ref={formRef}
          action={formAction}
          noValidate
          onSubmit={() => {
            submitted.current = lines;
          }}
        >
          <h2 id="details-heading">Your details</h2>
          <p className={`muted ${styles.formIntro}`}>We’ll use these to confirm your order. We never share them.</p>

          {state.status === "failed" && (
            <div className={styles.alert} role="alert">
              <p>{state.message}</p>
              <a href={INSTAGRAM_URL}>Message @jaelushbeauty</a>
            </div>
          )}
          {hasErrors && (
            <p className={styles.alert} role="alert">
              Please check the highlighted {Object.values(errors).filter(Boolean).length === 1 ? "field" : "fields"}.
            </p>
          )}

          <input type="hidden" name={ORDER_FIELDS.items} value={JSON.stringify(lines)} />
          {/* Honeypot: hidden from people and screen readers. Bots that fill it in are ignored. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label>
              Company
              <input type="text" name={ORDER_FIELDS.honeypot} tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <Field id="name" label="Full name" error={errors.name}>
            <input
              id="name"
              name={ORDER_FIELDS.name}
              autoComplete="name"
              maxLength={ORDER_LIMITS.nameMax}
              value={details.name}
              onChange={update("name")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy("name")}
              required
            />
          </Field>

          <div className={styles.twoUp}>
            <Field id="phone" label="Phone or WhatsApp" error={errors.phone}>
              <input
                id="phone"
                name={ORDER_FIELDS.phone}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="024 123 4567"
                value={details.phone}
                onChange={update("phone")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy("phone")}
                required
              />
            </Field>
            <Field id="email" label="Email" error={errors.email}>
              <input
                id="email"
                name={ORDER_FIELDS.email}
                type="email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                maxLength={ORDER_LIMITS.emailMax}
                value={details.email}
                onChange={update("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describedBy("email", "email-hint")}
                required
              />
              <span id="email-hint" className={styles.hint}>
                We’ll send a copy of your order here.
              </span>
            </Field>
          </div>

          <fieldset className={styles.fulfilment} aria-describedby={errors.fulfilment ? errorId("fulfilment") : undefined}>
            <legend>How would you like to receive it?</legend>
            <div className={styles.choices}>
              {FULFILMENT_OPTIONS.map((option) => (
                <label key={option} className={styles.choice}>
                  <input
                    type="radio"
                    name={ORDER_FIELDS.fulfilment}
                    value={option}
                    checked={details.fulfilment === option}
                    onChange={() => {
                      setDetails((d) => ({ ...d, fulfilment: option }));
                      setErrors((errs) => ({ ...errs, fulfilment: undefined, address: undefined }));
                    }}
                  />
                  <span className={styles.choiceTitle}>{FULFILMENT_LABELS[option]}</span>
                  <span className={styles.choiceHint}>{FULFILMENT_HINTS[option]}</span>
                </label>
              ))}
            </div>
            {errors.fulfilment && (
              <p className={styles.fieldError} id={errorId("fulfilment")}>
                {errors.fulfilment}
              </p>
            )}
          </fieldset>

          {details.fulfilment === "delivery" && (
            <Field id="address" label="Delivery address" error={errors.address}>
              <textarea
                id="address"
                name={ORDER_FIELDS.address}
                autoComplete="street-address"
                rows={3}
                maxLength={ORDER_LIMITS.addressMax}
                placeholder="House number, street, area and a landmark"
                value={details.address}
                onChange={update("address")}
                aria-invalid={Boolean(errors.address)}
                aria-describedby={describedBy("address")}
                required
              />
            </Field>
          )}

          <Field id="notes" label="Notes" optional error={errors.notes}>
            <textarea
              id="notes"
              name={ORDER_FIELDS.notes}
              rows={3}
              maxLength={ORDER_LIMITS.notesMax}
              placeholder="Gift message, preferred time, questions…"
              value={details.notes}
              onChange={update("notes")}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={describedBy("notes")}
            />
          </Field>

          <button type="submit" className={`btn ${styles.submit}`} disabled={pending}>
            {pending ? (
              <>
                <span className={styles.spinner} aria-hidden="true" /> Sending your order…
              </>
            ) : (
              <>Send order request · {itemCountLabel(count)}</>
            )}
          </button>
          <p className={styles.reassure}>Nothing is charged now. We’ll confirm your total before you pay.</p>
        </form>
      </section>
    </div>
  );
}

/** The basket list with quantity controls, plus the reassurance that nothing is paid yet. */
function BasketLines({ products, itemsError }: { products: Map<string, BasketProduct>; itemsError?: string }) {
  const { lines, count, setQuantity, remove } = useBasket();
  return (
    <section aria-labelledby="basket-heading" className={styles.basket}>
      <div className={styles.panelHead}>
        <h2 id="basket-heading">Your basket</h2>
        <span className="muted">{itemCountLabel(count)}</span>
      </div>
      {itemsError && (
        <p className={styles.fieldError} id="items-error">
          {itemsError}
        </p>
      )}
      <ul className={styles.lines}>
        {lines.map((line) => {
          const p = products.get(line.slug);
          if (!p) return null;
          return (
            <li key={line.slug} className={styles.line}>
              <Link href={p.href} className={styles.thumb} style={{ background: p.tint }} tabIndex={-1} aria-hidden="true">
                <Image src={p.image.src} alt="" fill sizes="88px" style={{ objectFit: "cover", objectPosition: p.image.position }} />
              </Link>
              <div className={styles.lineInfo}>
                <Link href={p.href} className={styles.lineName}>
                  {p.name}
                </Link>
                <span className={styles.lineVariant}>{p.variant}</span>
              </div>
              <div className={styles.lineControls}>
                <QuantityStepper value={line.quantity} onChange={(q) => setQuantity(line.slug, q)} label={p.name} size="small" />
                <button type="button" className={styles.remove} onClick={() => remove(line.slug, p.name)}>
                  Remove<span className="sr-only"> {p.name}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <Link href={SHOP_PATH} className={styles.continue}>
        <span aria-hidden="true">←</span> Continue shopping
      </Link>

      <div className={styles.howItWorks}>
        <h3>No payment needed now</h3>
        <ol>
          <li>Send your order request. It takes about a minute.</li>
          <li>We reply with your total by email or phone.</li>
          <li>You pay, and we arrange delivery or pickup.</li>
        </ol>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.field}${error ? ` ${styles.hasError}` : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>
      {children}
      {error && (
        <p className={styles.fieldError} id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function Confirmation({
  state,
  lines,
  bySlug,
  headingRef,
}: {
  state: Extract<OrderState, { status: "sent" }>;
  lines: BasketLine[];
  bySlug: Map<string, BasketProduct>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const summaryId = useId();
  return (
    <div className={styles.confirmation}>
      <div className={styles.tick} aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path className={styles.tickPath} d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h2 ref={headingRef} tabIndex={-1}>
        Thank you, your order is in
      </h2>
      <p className={styles.reference}>
        Order reference <strong>{state.reference}</strong>
      </p>
      <p className="muted">
        {state.confirmationSent && state.email
          ? `We’ve emailed a copy to ${state.email}. `
          : "Keep your reference handy in case you need to get in touch. "}
        We’ll reply soon with your total and to arrange {state.fulfilment === "delivery" ? "delivery" : "a pickup time"}.
      </p>

      {lines.length > 0 && (
        <section aria-labelledby={summaryId} className={styles.summary}>
          <h3 id={summaryId}>What you ordered</h3>
          <ul>
            {lines.map((l) => {
              const p = bySlug.get(l.slug);
              return p ? (
                <li key={l.slug}>
                  <span>
                    {p.name} <span className="muted">· {p.variant}</span>
                  </span>
                  <span>× {l.quantity}</span>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}

      <div className={styles.confirmActions}>
        <Link href={SHOP_PATH} className="btn">
          Continue shopping
        </Link>
        <a href={INSTAGRAM_URL} className="btn btn-ghost">
          Follow @jaelushbeauty
        </a>
      </div>
    </div>
  );
}
