# VENTREXS AI — PRODUCTION DEPLOYMENT CHECKLIST

**Application:** Ventrexs AI  
**Canonical Domain:** `https://ventrexs.com`  
**Subdomains:** `app.ventrexs.com`, `agency.ventrexs.com`, `admin.ventrexs.com`  
**Hosting Target:** Vercel / Next.js Production Infrastructure + Supabase Cloud  

This checklist must be executed sequentially by the DevOps engineer and Platform Owners during the live production deployment.

---

### 1. Domain Configuration
- [ ] Root apex domain `ventrexs.com` registered and active.
- [ ] Subdomains planned: `www.ventrexs.com`, `app.ventrexs.com`, `agency.ventrexs.com`, `admin.ventrexs.com`.
- [ ] Automatic HTTPS/TLS certificate issuance verified for apex and all wildcard/subdomains.
- [ ] Verify `BRAND.domain = 'https://ventrexs.com'` in `src/config/brand.ts`.

---

### 2. DNS Records
Configure the following DNS records with your registrar or Cloudflare:

| Type | Host | Value / Target | TTL | Proxy Status |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` (or Hosting Provider IP) | Auto | Proxied / DNS Only |
| **CNAME** | `www` | `cname.vercel-dns.com` | Auto | Proxied / DNS Only |
| **CNAME** | `app` | `cname.vercel-dns.com` | Auto | Proxied / DNS Only |
| **CNAME** | `agency` | `cname.vercel-dns.com` | Auto | Proxied / DNS Only |
| **CNAME** | `admin` | `cname.vercel-dns.com` | Auto | Proxied / DNS Only |
| **TXT** | `@` | `v=spf1 include:resend.com ~all` (Email SPF) | Auto | DNS Only |
| **CNAME** | `resend._domainkey` | `dkim.resend.com` (Email DKIM) | Auto | DNS Only |
| **TXT** | `_dmarc` | `v=DMARC1; p=reject; rua=mailto:dmarc@ventrexs.com` | Auto | DNS Only |

- [ ] Verify DNS propagation via `dig` or DNS lookup tools.

---

### 3. Hosting Platform Configuration (Vercel / Cloudflare)
- [ ] Link GitHub repository to production hosting project.
- [ ] Framework preset set to **Next.js**.
- [ ] Build Command set to: `npm run build`.
- [ ] Output Directory set to: `.next`.
- [ ] Node.js Version configured to `20.x` or `22.x` LTS.
- [ ] Custom Domains added to project settings: `ventrexs.com`, `www.ventrexs.com`, `app.ventrexs.com`, `agency.ventrexs.com`, `admin.ventrexs.com`.

---

### 4. Supabase Production Project
- [ ] Create dedicated Production Supabase Project (e.g. AWS `us-east-1` or target region).
- [ ] Note down:
  - **Project URL:** `https://<prod-id>.supabase.co`
  - **Anon Key:** (Public)
  - **Service Role Key:** (Server-Only Secret)
- [ ] Enable Database Connection Pooling (PgBouncer / Supavisor) for serverless performance.
- [ ] Configure Auth Settings:
  - Site URL: `https://ventrexs.com`
  - Redirect URLs:
    - `https://ventrexs.com/**`
    - `https://app.ventrexs.com/**`
    - `https://agency.ventrexs.com/**`
    - `https://admin.ventrexs.com/**`
  - JWT Expiry: `3600` seconds (1 hour) with refresh token rotation enabled.

---

### 5. Environment Variables Deployment
Set all environment variables in hosting project dashboard (Production environment scope only):

#### Public Variables:
- [ ] `NEXT_PUBLIC_APP_URL=https://ventrexs.com`
- [ ] `NEXT_PUBLIC_AGENCY_URL=https://agency.ventrexs.com`
- [ ] `NEXT_PUBLIC_ADMIN_URL=https://admin.ventrexs.com`
- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] `NEXT_PUBLIC_SUPABASE_URL=https://<prod-id>.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-CSXL6SMYTC`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...` (if Stripe is used)

#### Server-Only Secrets:
- [ ] `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...`
- [ ] `PLATFORM_ADMIN_1_EMAIL=<superadmin1@ventrexs.com>`
- [ ] `PLATFORM_ADMIN_2_EMAIL=<superadmin2@ventrexs.com>`
- [ ] `SAAS_PAYMENT_PROVIDER=razorpay` (or `stripe`)
- [ ] `CUSTOMER_PAYMENT_PROVIDER=razorpay` (or `stripe`)
- [ ] `RAZORPAY_KEY_ID=rzp_live_...`
- [ ] `RAZORPAY_KEY_SECRET=...`
- [ ] `RAZORPAY_WEBHOOK_SECRET=...`
- [ ] `STRIPE_SECRET_KEY=sk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] `GEMINI_API_KEY=...`
- [ ] `RESEND_API_KEY=re_...`
- [ ] `EMAIL_FROM=Ventrexs AI <notifications@ventrexs.com>`
- [ ] (Optional) Twilio & WhatsApp Cloud API credentials if SMS/WhatsApp channels are enabled.

---

### 6. Stripe Live Configuration (If Active)
- [ ] Activate Stripe Live Account.
- [ ] Copy Live Secret Key (`sk_live_...`) into hosting environment.
- [ ] Copy Live Publishable Key (`pk_live_...`) into hosting environment.
- [ ] Create live recurring SaaS subscription products/prices corresponding to Ventrexs tiers.
- [ ] Configure Stripe Customer Portal for automated subscription management.

---

### 7. Razorpay Live Configuration (If Active)
- [ ] Complete Razorpay Live KYC verification.
- [ ] Generate Live API Keys (`rzp_live_...` and Key Secret).
- [ ] Create live Razorpay Subscription Plans matching Ventrexs pricing tiers.
- [ ] Enable UPI AutoPay, Netbanking, and Credit Cards in Razorpay Checkout settings.

---

### 8. Google Play Production Configuration (If Active)
- [ ] Create Google Play Developer Console App (`com.ventrexs.app`).
- [ ] Set up Google Cloud Service Account with `Android Publisher API` role.
- [ ] Generate and download RSA Private Key in JSON format.
- [ ] Set `GOOGLE_PLAY_PACKAGE_NAME=com.ventrexs.app` and insert service account credentials.
- [ ] Set up Google Cloud Pub/Sub Topic and Subscription for Real-Time Developer Notifications (RTDN).

---

### 9. Webhook URLs Configuration
Register the following endpoints in your respective provider developer dashboards:

- [ ] **Stripe Webhooks:**
  - Endpoint URL: `https://ventrexs.com/api/webhooks/stripe`
  - Events to Listen: `payment_intent.succeeded`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Copy Webhook Signing Secret (`whsec_...`) $\rightarrow$ `STRIPE_WEBHOOK_SECRET`.
- [ ] **Razorpay Webhooks:**
  - Endpoint URL: `https://ventrexs.com/api/webhooks/razorpay`
  - Events to Listen: `payment.captured`, `payment.failed`, `order.paid`, `subscription.charged`, `subscription.halted`, `subscription.cancelled`
  - Copy Secret $\rightarrow$ `RAZORPAY_WEBHOOK_SECRET`.
- [ ] **WhatsApp Webhook:**
  - Callback URL: `https://ventrexs.com/api/webhooks/communications/whatsapp`
  - Verify Token: Match with `WHATSAPP_VERIFY_TOKEN`.
  - Subscribed Fields: `messages`.

---

### 10. Authentication Callbacks & OAuth
- [ ] Configure Supabase Auth Redirect URLs:
  - `https://ventrexs.com/auth/callback`
  - `https://ventrexs.com/dashboard`
  - `https://agency.ventrexs.com/agency`
  - `https://admin.ventrexs.com/admin`
- [ ] (If Google OAuth active) Configure Google Cloud OAuth Consent Screen with authorized redirect URI: `https://<prod-id>.supabase.co/auth/v1/callback`.

---

### 11. Database Migrations
- [ ] Execute all 23 database migrations in chronological sequence against the production PostgreSQL instance.
- [ ] Verify that RLS is active on all tables (`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`).
- [ ] Verify foreign keys and cascade rules.
- [ ] Seed initial Superadmin identities in Supabase Auth matching `PLATFORM_ADMIN_1_EMAIL` and `PLATFORM_ADMIN_2_EMAIL`.

---

### 12. Security Verification
- [ ] Verify `NEXT_PUBLIC_DEMO_MODE=false` in production build.
- [ ] Verify no secrets are exposed in browser DevTools Network/Sources tabs.
- [ ] Verify HTTPS redirection is active (HTTP $\rightarrow$ HTTPS 301).
- [ ] Verify security response headers using `curl -I https://ventrexs.com`:
  - `Strict-Transport-Security`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy`
- [ ] Verify cross-tenant isolation: User A cannot read or query User B's business data.
- [ ] Verify Agency boundary: Agency users cannot view client dashboards without explicit delegation.
- [ ] Verify Admin boundary: Non-admin users cannot access `/admin/*`.

---

### 13. Smoke Testing Checklist
- [ ] **Public Site:** Load `https://ventrexs.com` (Homepage, Features, Pricing, About, Contact, Privacy, Terms).
- [ ] **Business Signup:** Complete user signup $\rightarrow$ Onboarding $\rightarrow$ Access Business Dashboard.
- [ ] **Agency Signup:** Complete agency signup $\rightarrow$ Agency Onboarding $\rightarrow$ Agency Dashboard.
- [ ] **Invoicing Flow:** Create a customer $\rightarrow$ Generate an invoice $\rightarrow$ Generate secure payment request link `/pay/[token]`.
- [ ] **Webhook Test:** Trigger provider test webhook $\rightarrow$ Verify signature verification passes and idempotency deduplication logs event.
- [ ] **AI Receptionist:** Test voice/chat triage prompt with budget safety limits.

---

### 14. Rollback Plan
In the event of a critical deployment failure or regression:

1. **Instant Hosting Rollback:**
   - On Vercel / Hosting dashboard, click **Deployments** $\rightarrow$ select the previous stable deployment $\rightarrow$ click **Instant Rollback**.
2. **DNS Failover (if applicable):**
   - Switch DNS records back to maintenance/holding page or prior provider.
3. **Database Restore:**
   - Supabase Point-in-Time Recovery (PITR) allows rolling back the PostgreSQL instance to any minute before the deployment failure.
4. **Credential Rotation:**
   - If any API key or secret is compromised during deployment, immediately revoke and rotate via the respective provider dashboard (Stripe, Razorpay, Supabase, Twilio).
