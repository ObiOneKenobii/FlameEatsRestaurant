# 🔥 FlameEats — Food Delivery App (Paystack)

A full-stack food delivery app built with Next.js 15, Convex, and Paystack.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Convex (database, real-time, auth, server functions)
- **Auth**: @convex-dev/auth with email/password
- **Payments**: Paystack (Popup V2 + server-side initialize + verify)

## Paystack Integration Flow (Official)
1. User clicks "Pay with Paystack"
2. Frontend POSTs to `/api/paystack/initialize` with email, amount, orderId
3. Server calls Paystack Initialize API (secret key stays on server)
4. Server returns `access_code` to frontend
5. Frontend calls `PaystackPop.resumeTransaction(access_code)` — opens popup
6. After payment, frontend verifies via `/api/paystack/verify?reference=...`
7. Convex order is updated to `paid` + `confirmed`
8. Webhook at `/api/webhooks/paystack` also listens for `charge.success`

---

## Setup Instructions

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Set up Convex
```bash
npx convex dev
```
Copy the `NEXT_PUBLIC_CONVEX_URL` from the output.

### Step 3 — Set up Convex Auth
```bash
npx @convex-dev/auth
```
This generates `CONVEX_AUTH_PRIVATE_KEY` and `JWKS`.

### Step 4 — Create your `.env.local`
```bash
cp .env.example .env.local
```

Fill in:
```
NEXT_PUBLIC_CONVEX_URL=           # from Step 2
CONVEX_AUTH_PRIVATE_KEY=          # from Step 3
JWKS=                             # from Step 3
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=  # from Paystack dashboard > Settings > API Keys
PAYSTACK_SECRET_KEY=              # from Paystack dashboard > Settings > API Keys
```

Get your Paystack keys at: https://dashboard.paystack.com/#/settings/developer

### Step 5 — Run the app
Terminal 1:
```bash
npx convex dev
```
Terminal 2:
```bash
npm run dev
```

Open http://localhost:3000

### Step 6 — Paystack Webhook (for production)
In your Paystack dashboard go to Settings > Webhooks and add:
```
https://yourdomain.com/api/webhooks/paystack
```

---

## Project Structure
```
src/app/
  api/
    paystack/
      initialize/route.ts   # Server: init transaction, returns access_code
      verify/route.ts       # Server: verify payment after popup
    webhooks/
      paystack/route.ts     # Server: receive charge.success events
  checkout/page.tsx         # Paystack Popup V2 integration
```
