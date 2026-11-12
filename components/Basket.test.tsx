import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MAX_QUANTITY_PER_LINE } from "@/lib/basket";
import AddToBasket from "./AddToBasket";
import BasketProvider from "./BasketProvider";
import QuickAdd from "./QuickAdd";

const STORAGE_KEY = "jaelush-basket-v1";
const SLUGS = ["glow-bar", "detox-bar"];

function renderWithBasket(ui: React.ReactNode) {
  return render(<BasketProvider slugs={SLUGS}>{ui}</BasketProvider>);
}

function stored() {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
}

describe("AddToBasket", () => {
  test("adds the chosen quantity, saves it and announces it", async () => {
    const user = userEvent.setup();
    renderWithBasket(<AddToBasket slug="glow-bar" label="Glow Bar" />);

    await user.click(screen.getByRole("button", { name: "Increase Glow Bar" }));
    await user.click(screen.getByRole("button", { name: /add to basket/i }));

    expect(stored()).toEqual([{ slug: "glow-bar", quantity: 2 }]);
    expect(screen.getByRole("status")).toHaveTextContent("2 × Glow Bar added to your basket");
    expect(screen.getByText(/2 in your basket/)).toBeTruthy();
    // The picker resets so a second click doesn't double up by surprise.
    expect(screen.getByRole("spinbutton", { name: "Glow Bar quantity" })).toHaveValue(1);
  });

  test("near the limit, the picker stops at what fits and says why", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ slug: "glow-bar", quantity: 18 }]));
    const user = userEvent.setup();
    renderWithBasket(<AddToBasket slug="glow-bar" label="Glow Bar" />);

    expect(await screen.findByText(`You can add 2 more (limit ${MAX_QUANTITY_PER_LINE} per order).`)).toBeTruthy();
    const increase = screen.getByRole("button", { name: "Increase Glow Bar" });
    await user.click(increase);
    expect(increase).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /add to basket/i }));
    expect(stored()).toEqual([{ slug: "glow-bar", quantity: MAX_QUANTITY_PER_LINE }]);
    expect(screen.getByRole("button", { name: "Basket limit reached" })).toBeDisabled();
    expect(screen.getByText(/That’s the limit of 20 per order/)).toBeTruthy();
  });
});

describe("QuickAdd", () => {
  test("adds one, and is disabled with an explanation once the limit is reached", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ slug: "glow-bar", quantity: MAX_QUANTITY_PER_LINE - 1 }]));
    const user = userEvent.setup();
    renderWithBasket(<QuickAdd slug="glow-bar" label="Glow Bar" />);

    await user.click(await screen.findByRole("button", { name: "Add Glow Bar to basket" }));
    expect(stored()).toEqual([{ slug: "glow-bar", quantity: MAX_QUANTITY_PER_LINE }]);
    expect(screen.getByRole("button", { name: `Glow Bar: limit of ${MAX_QUANTITY_PER_LINE} reached` })).toBeDisabled();
  });
});

describe("BasketProvider", () => {
  test("drops corrupt or unknown saved data instead of crashing", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ slug: "gone", quantity: 2 }, { slug: "detox-bar", quantity: "x" }]));
    renderWithBasket(<AddToBasket slug="glow-bar" label="Glow Bar" />);
    await screen.findByRole("button", { name: /add to basket/i });
    expect(screen.queryByText(/in your basket/)).toBeNull();
  });

  test("still works when storage is blocked, and warns once it can't save", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const user = userEvent.setup();
    renderWithBasket(<AddToBasket slug="glow-bar" label="Glow Bar" />);

    await user.click(screen.getByRole("button", { name: /add to basket/i }));
    expect(screen.getByText(/1 in your basket/)).toBeTruthy();
    expect(warn).toHaveBeenCalledWith("Could not save the basket to localStorage", expect.any(Error));
  });

  test("follows changes made in another tab", async () => {
    renderWithBasket(<AddToBasket slug="glow-bar" label="Glow Bar" />);
    await screen.findByRole("button", { name: /add to basket/i });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: JSON.stringify([{ slug: "glow-bar", quantity: 4 }]) }),
      );
    });
    expect(screen.getByText(/4 in your basket/)).toBeTruthy();
  });
});
