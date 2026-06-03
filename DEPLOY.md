# Deploying SoccerDadHQ → soccerdadhq.com

Path: **GitHub → Vercel**, domain at an **external registrar**, launching in **demo mode**
(no Supabase/Resend yet — seeded data, fully browsable; logins/reviews/votes/emails
switch on later when keys are added).

---

## 1. Push to GitHub

The repo is already initialized locally. Create an **empty** repo on GitHub
(no README/license), then:

```bash
git remote add origin https://github.com/<you>/soccerdadhq.git
git branch -M main
git push -u origin main
```

> `.gitignore` already excludes `.env`, `.env*.local`, `.next`, `node_modules`,
> and `.vercel`, so no secrets are committed. Only `.env.local.example` is tracked.

## 2. Import into Vercel

1. vercel.com → **Add New… → Project** → import the GitHub repo.
2. Framework preset auto-detects **Next.js**. Leave build/output defaults.
3. **Environment Variables** — for a demo-mode launch you only need:
   - `NEXT_PUBLIC_SITE_URL = https://soccerdadhq.com`
   (Everything else can stay unset; the app no-ops gracefully.)
4. **Deploy.** You'll get a `*.vercel.app` URL — confirm the site looks right there
   first.

The crons in `vercel.json` (`/api/cron/ranking-snapshot`, `/api/cron/newsletter`)
are picked up automatically. They no-op safely until Supabase/Resend exist.

## 3. Add the domain (registrar elsewhere)

1. Vercel → Project → **Settings → Domains** → add `soccerdadhq.com`
   **and** `www.soccerdadhq.com`.
2. Vercel shows the records to create. At your registrar's DNS panel, add:
   - **A** record · host `@` · value **76.76.21.21**
   - **CNAME** record · host `www` · value **cname.vercel-dns.com**
   (Use whatever values Vercel displays — they are the source of truth.)
3. Optional but cleaner: set Vercel as the **redirect** so `www` → apex (or vice-versa)
   — Vercel offers a one-click toggle.
4. Wait for DNS to propagate (minutes to a few hours). Vercel auto-issues the
   HTTPS certificate once records resolve.

## 4. Verify live

- `https://soccerdadhq.com` loads over HTTPS.
- View-source: canonical/OG URLs point at `https://soccerdadhq.com` (driven by
  `NEXT_PUBLIC_SITE_URL`).
- `https://soccerdadhq.com/sitemap.xml` and `/robots.txt` resolve.

---

## Later: turning on the full backend

When ready to move past demo mode, add these in Vercel → Settings → Environment
Variables, then redeploy (see `.env.local.example` for the full annotated list):

| Variable | Enables |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth, reviews, votes, claims, submissions, poll votes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin queue, ranking-snapshot cron, poll/admin reads |
| `CRON_SECRET` | Protects the cron endpoints (Vercel sends it as a Bearer token) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Welcome email + weekly Sideline digests |
| `UNSUBSCRIBE_SECRET` | Signs one-click unsubscribe links |
| `NEXT_PUBLIC_PAYMENT_LINK` | "Pay to activate" button on claims/ad orders |
| `NEXT_PUBLIC_ADSENSE_CLIENT` / `_SLOT` | Fills unsold ad slots with AdSense |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` or `NEXT_PUBLIC_GA_ID` | Analytics |

Then run `supabase/schema.sql` in the Supabase SQL editor to create the tables,
views, RLS policies and grants (clubs, reviews, claim_requests, submissions,
poll_votes + poll_results, etc.). Set a user's `profiles.role = 'admin'` to access
`/admin`.

For Resend, verify the `soccerdadhq.com` sending domain (SPF/DKIM records at your
registrar) before mail will deliver.
