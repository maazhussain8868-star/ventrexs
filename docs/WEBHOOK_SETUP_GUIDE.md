# Ventrexs AI — Razorpay & Stripe Webhook & Payment Setup Guide

This guide explains how to configure Razorpay and Stripe in your development and production environments, register your webhook endpoints, and test the subscription lifecycle.

---

## 1. Environment Keys Summary

Ensure the following variables are defined in your `.env.local` (or production hosting environment secrets):

```bash
# --- Paywall Bypass (Set to false for unrestricted testing) ---
NEXT_PUBLIC_ENABLE_PAYWALL=true

# --- Razorpay (India & UPI / Cards) ---
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYY
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here

# --- Stripe (International USD Cards) ---
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51XXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_51XXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 2. Registering Webhook in Razorpay Dashboard

### Step 1: Open the Webhooks Settings
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Toggle to **Test Mode** (or Live Mode when launching).
3. In the left navigation, go to **Settings** > **Webhooks**.
4. Click **+ Add New Webhook**.

### Step 2: Configure Webhook Endpoint
- **Webhook URL**:
  - For Production: `https://www.ventrexs.com/api/webhooks/razorpay`
  - For Local Testing (via ngrok/tunnel): `https://<your-ngrok-subdomain>.ngrok-free.app/api/webhooks/razorpay`
- **Secret**: Enter a secure random string (e.g. `rzp_sec_2026_ventrexs_ai`).  
  *Copy this exact secret to `RAZORPAY_WEBHOOK_SECRET` in your `.env.local`.*
- **Alert Email**: Enter your notification email (e.g. `alerts@ventrexs.com`).

### Step 3: Select Active Events
Check the following events:
- [x] `order.paid`
- [x] `payment.captured`
- [x] `payment.failed`
- [x] `subscription.activated`
- [x] `subscription.charged`
- [x] `subscription.completed`
- [x] `subscription.updated`
- [x] `subscription.cancelled`
- [x] `subscription.paused`
- [x] `subscription.resumed`

Click **Save**.

---

## 3. Registering Webhook in Stripe Dashboard

### Step 1: Open the Webhooks Settings
1. Log in to the [Stripe Dashboard](https://dashboard.stripe.com).
2. Ensure **Test Mode** toggle is switched on in the top-right corner.
3. In the top search bar, go to **Developers** > **Webhooks**.
4. Click **+ Add destination** or **Add endpoint**.

### Step 2: Configure Webhook Endpoint
- **Endpoint URL**:
  - For Production: `https://www.ventrexs.com/api/webhooks/stripe`
  - For Local Testing: Use Stripe CLI (recommended, see below) or your public tunnel URL.
- **Description**: `Ventrexs SaaS Subscription Events`
- **Events to send**: Click **Select events** and check:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

Click **Add endpoint**.

### Step 3: Reveal Signing Secret
1. On the webhook details page, locate the **Signing secret** section.
2. Click **Reveal**.
3. Copy the string starting with `whsec_...` into `STRIPE_WEBHOOK_SECRET` in your `.env.local`.

---

## 4. Local Webhook Testing

### Testing Stripe Webhooks via Stripe CLI (Fastest)
Install the Stripe CLI and run:
```powershell
# 1. Login to your Stripe test account
stripe login

# 2. Forward incoming test events directly to your local Next.js server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI will print a local signing secret:
# > Ready! Your webhook signing secret is whsec_123456...
# Paste this whsec_ key into STRIPE_WEBHOOK_SECRET in .env.local while testing locally.

# 3. In another terminal, trigger a test subscription completion
stripe trigger checkout.session.completed
```

### Testing Razorpay Webhooks via Tunnel
Use ngrok or Cloudflare Tunnels:
```powershell
ngrok http 3000
```
Use the forwarded HTTPS URL (e.g. `https://abc-123.ngrok-free.app/api/webhooks/razorpay`) as your Webhook URL in the Razorpay Test Dashboard, and trigger test payments from the dashboard.

---

## 5. Subscription Paywall Bypass Toggle

During development or team testing, you can bypass the paywall without entering card details:
- In `.env.local`, set:
  ```bash
  NEXT_PUBLIC_ENABLE_PAYWALL=false
  ```
- All protected routes (`/dashboard`, `/invoices`, `/leads`, `/appointments`, etc.) will become directly accessible.
- Set back to `NEXT_PUBLIC_ENABLE_PAYWALL=true` to test the full paywall gate and redirect behavior to `/pricing`.
