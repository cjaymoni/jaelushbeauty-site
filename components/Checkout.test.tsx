import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { submitOrder } from "@/app/basket/actions";
import type { OrderState } from "@/lib/order-email";
import BasketProvider from "./BasketProvider";
import Checkout, { type BasketProduct } from "./Checkout";

// The real action sends email; each test decides what the server answers.
vi.mock("@/app/basket/actions", () => ({ submitOrder: vi.fn() }));
const serverReplies = (state: OrderState) => vi.mocked(submitOrder).mockResolvedValue(state);

const STORAGE_KEY = "jaelush-basket-v1";
const products: BasketProduct[] = [
  { slug: "glow-bar", name: "Glow Bar", variant: "Carrot & Turmeric", href: "/shop/soaps/glow-bar", image: { src: "/g.jpg" }, tint: "#fff" },
];

function renderCheckout(lines: { slug: string; quantity: number }[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  return render(
    <BasketProvider slugs={products.map((p) => p.slug)}>
      <Checkout products={products} suggestions={<p>Favourites go here</p>} />
    </BasketProvider>,
  );
}

async function fillValidDetails(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "Ama Mensah");
  await user.type(screen.getByLabelText("Phone or WhatsApp"), "0241234567");
  await user.type(screen.getByLabelText("Email"), "ama@example.com");
  await user.type(screen.getByLabelText("Delivery address"), "12 Palm Street");
}

const submit = () => screen.getByRole("button", { name: /send order request/i });

beforeEach(() => vi.mocked(submitOrder).mockReset());

describe("Checkout", () => {
  test("an empty basket shows a way back to the shop and suggestions", async () => {
    renderCheckout([]);
    expect(await screen.findByRole("heading", { name: "Your basket is empty" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse the shop" })).toBeInTheDocument();
    expect(screen.getByText("Favourites go here")).toBeInTheDocument();
  });

  test("lists the basket and sends its lines with the form", async () => {
    serverReplies({ status: "failed", message: "x" });
    const user = userEvent.setup();
    renderCheckout([{ slug: "glow-bar", quantity: 3 }]);

    expect(await screen.findByRole("link", { name: "Glow Bar" })).toBeInTheDocument();
    await fillValidDetails(user);
    await user.click(submit());

    await waitFor(() => expect(submitOrder).toHaveBeenCalledOnce());
    const form = vi.mocked(submitOrder).mock.calls[0][1];
    expect(JSON.parse(String(form.get("items")))).toEqual([{ slug: "glow-bar", quantity: 3 }]);
    expect(form.get("name")).toBe("Ama Mensah");
  });

  test("server field errors are shown, focus the first one, and clear when edited", async () => {
    serverReplies({ status: "invalid", fieldErrors: { phone: "Enter a phone number.", email: "Enter an email." } });
    const user = userEvent.setup();
    renderCheckout([{ slug: "glow-bar", quantity: 1 }]);

    await user.click(await screen.findByRole("button", { name: /send order request/i }));

    const phone = screen.getByLabelText("Phone or WhatsApp");
    await waitFor(() => expect(phone).toHaveFocus());
    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(phone).toHaveAccessibleDescription("Enter a phone number.");
    expect(screen.getByRole("alert")).toHaveTextContent("Please check the highlighted fields.");

    await user.type(phone, "0");
    expect(phone).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByText("Enter a phone number.")).toBeNull();
    expect(screen.getByRole("alert")).toHaveTextContent("Please check the highlighted field.");
  });

  test("pickup hides the address field", async () => {
    const user = userEvent.setup();
    renderCheckout([{ slug: "glow-bar", quantity: 1 }]);

    expect(await screen.findByLabelText("Delivery address")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /pickup/i }));
    expect(screen.queryByLabelText("Delivery address")).toBeNull();
  });

  test("a failed send keeps the basket and offers another way to order", async () => {
    serverReplies({ status: "failed", message: "We couldn’t send your order just now." });
    const user = userEvent.setup();
    renderCheckout([{ slug: "glow-bar", quantity: 2 }]);

    await fillValidDetails(user);
    await user.click(submit());

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t send your order just now.");
    expect(screen.getByRole("link", { name: "Message @jaelushbeauty" })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual([{ slug: "glow-bar", quantity: 2 }]);
  });

  test("a sent order shows the reference and what was ordered, empties the basket and moves focus", async () => {
    serverReplies({ status: "sent", reference: "JB-1112-K7QM", fulfilment: "delivery", confirmationSent: true, email: "ama@example.com" });
    const user = userEvent.setup();
    renderCheckout([{ slug: "glow-bar", quantity: 2 }]);

    await fillValidDetails(user);
    await user.click(submit());

    const heading = await screen.findByRole("heading", { name: "Thank you, your order is in" });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByText("JB-1112-K7QM")).toBeInTheDocument();
    expect(screen.getByText(/emailed a copy to ama@example.com/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "What you ordered" })).toHaveTextContent("Glow Bar");
    expect(screen.getByRole("region", { name: "What you ordered" })).toHaveTextContent("× 2");
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual([]));
  });

  test("when the customer copy failed, the confirmation doesn't claim it was emailed", async () => {
    serverReplies({ status: "sent", reference: "JB-1112-K7QM", fulfilment: "pickup", confirmationSent: false, email: "ama@example.com" });
    const user = userEvent.setup();
    renderCheckout([{ slug: "glow-bar", quantity: 1 }]);

    await fillValidDetails(user);
    await user.click(submit());

    expect(await screen.findByText(/Keep your reference handy/)).toBeInTheDocument();
    expect(screen.queryByText(/emailed a copy/)).toBeNull();
  });
});
