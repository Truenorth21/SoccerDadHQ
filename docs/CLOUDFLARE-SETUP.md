# Moving SoccerDadHQ to Cloudflare: step by step

This takes about 30–45 minutes. Do the steps in order. Everything happens in your
web browser. Where it says "send Claude", paste the value into the project thread.

## Before you start
- Merge **PR #13** (the usage fix) on GitHub if you haven't already.
- Keep your Vercel tab open. You'll copy your settings (environment variables) from it.
  In Vercel: open the **soccerdad** project → **Settings** → **Environment Variables**.

## 1. Create a free Cloudflare account
1. Go to **dash.cloudflare.com/sign-up** and sign up with your email.
2. Confirm your email.

## 2. Turn on R2 storage (this is where cached pages are saved)
1. In the left sidebar click **Storage & databases** → **R2 object storage**.
2. Click **Get started / Purchase R2**. Cloudflare asks for a card. The free tier
   (10 GB) is far more than the site needs, so you won't be charged.
3. Click **Create bucket**, name it exactly `soccerdadhq-cache`, and click **Create bucket**.

## 3. Create the small database for cache refreshes
1. Sidebar → **Storage & databases** → **D1 SQL database** → **Create database**.
2. Name it exactly `soccerdadhq-tag-cache` and click **Create**.
3. On the next page, copy the **Database ID** (a long code like `1a2b3c4d-...`)
   and **send it to Claude**. I'll put it into the code, and then you merge the Cloudflare PR.

## 4. Connect the site's code (after the Cloudflare PR is merged)
1. Sidebar → **Compute (Workers)** → **Workers & Pages** → **Create** → **Import a repository**.
2. Click **Connect GitHub**, allow access to **SoccerDadHQ**, then pick it.
3. Fill in:
   - **Project name:** `soccerdadhq` (must be exactly this)
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy`
4. Open **Advanced settings** → **Build variables**. Add each of these, copying the
   value from Vercel:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`,
   and any other names in Vercel that start with `NEXT_PUBLIC_`.
5. Click **Deploy** and wait for the green check mark.

## 5. Add the secret settings
1. Open the new **soccerdadhq** worker → **Settings** → **Variables and Secrets** → **Add**.
2. Add each of these as type **Secret**, copying the value from Vercel (skip any that
   aren't in Vercel):
   `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_ALERT_EMAIL`, `UNSUBSCRIBE_SECRET`, `NEWSLETTER_MAX_PER_RUN`.
3. Add the same `NEXT_PUBLIC_...` ones from step 4 here too, as type **Text**.
4. Click **Deploy** to apply the changes.
5. Open the `....workers.dev` link shown on the worker's page. The site should load.

## 6. Point soccerdadhq.com at Cloudflare
1. Cloudflare home → **Add a domain** → type `soccerdadhq.com` → choose the **Free** plan.
2. Cloudflare shows two **nameservers**. Go to wherever you bought the domain (if you bought
   it through Vercel: Vercel → **Domains** → soccerdadhq.com → **Nameservers**) and
   replace the nameservers with Cloudflare's two.
3. Wait until Cloudflare emails you that the domain is active. This usually takes under
   an hour, but can take up to a day.
4. Worker **soccerdadhq** → **Settings** → **Domains & Routes** → **Add** → **Custom domain** →
   `soccerdadhq.com`. Repeat for `www.soccerdadhq.com`.

## 7. Check it and tidy up
- Visit soccerdadhq.com, open a club page, and try logging in.
- In Vercel, **Settings** → **Git** → **Disconnect**, so pushes no longer try to build there.
- If some pages show a Cloudflare **"Error 1102"**, those pages need more computing than the
  free plan allows. Sidebar → **Workers & Pages** → **Plans** → **Workers Paid** ($5/month) fixes it.

Nothing else changes: Supabase, Stripe, Resend and Google AdSense keep working with the same domain.
