This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Online orders

Customers add products to a basket (saved in the browser) and send an order
request from `/basket`. No payment is taken online. The order is emailed to the
shop through [Resend](https://resend.com), and the customer gets a copy with
their order reference. Replying to the shop's email reaches the customer.

Set these in `.env.local` (see `.env.example`) and in your host's environment:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. |
| `ORDER_EMAIL_TO` | Inbox that receives orders. |
| `ORDER_EMAIL_FROM` | Optional sender, default `Jaelush Beauty <orders@jaelushbeauty.com>`. The domain must be verified in Resend. |

In development, without these set, order emails are printed to the terminal so
you can try the flow. In production, orders are refused with a friendly message
until they are set.

Each visitor can send up to 5 valid orders per 15 minutes. Set
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (from a free Upstash
Redis database) so the limit is shared by every server instance. Without them,
or if Upstash is unreachable, the limit is kept in server memory and applies
per instance (see `lib/rate-limit.ts`).
