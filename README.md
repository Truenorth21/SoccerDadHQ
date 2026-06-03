# SoccerDadHQ.com

The home base for Florida youth soccer families — a media, directory, reviews, rankings and
community platform built with **Next.js 14 (App Router)**, **Tailwind CSS** and **Supabase**.

> Runs out of the box with zero configuration. The full club/coach directory, reviews, rankings,
> tryout alerts and live news work immediately on built-in seed data. Add Supabase keys to turn on
> real auth, persistent user reviews/votes and the newsletter list.

---

## Features

- **Homepage** — hero search, live tryout-alert ticker, aggregated news feed, top-clubs ranking
  preview, interactive parent poll, featured clubs, region browser, newsletter signup.
- **Club Directory** — full-text search; ZIP + radius (Haversine) filter; region, league, gender,
  age-group and "tryouts open" filters; sort by name / rating / reviews / distance.
- **Club Profiles** — gallery, description, contact + social links, leagues & age groups, six-category
  rating breakdown (Coaching, Development, Organization, Culture, Value, Facilities), reviews with
  star ratings, write-a-review form, map placeholder + Google Maps link, claim-profile CTA, nearby clubs.
- **Coach Directory & Profiles** — bio, certifications, specialties, age groups, private-training info,
  club affiliation, six-category reviews (Communication, Development, Personality, Fairness, Game
  Management, Overall Impact), and a contact form.
- **News Aggregator** — pulls live RSS from SoccerWire, TopDrawerSoccer, MLSsoccer.com and U.S. Soccer,
  auto-categorizes (ECNL, MLS NEXT, Girls Academy, Girls/Boys Soccer, Recruiting, Tournaments, Parent
  Life, Opinion), shows the source, and links out to the original article. Falls back to editorial
  content if feeds are unreachable.
- **Community Rankings** — top-3 podium, full voteable list, tabs for Clubs / Coaches / GK Trainers /
  Tournaments / Camps / Facilities, region & league filters, trend arrows, monthly reset, methodology.
- **Auth** — Google OAuth + email/password via Supabase, with a user **Dashboard**.
- **SEO** — dynamic per-page metadata, JSON-LD schema for clubs (`SportsActivityLocation` +
  `AggregateRating` + `Review`) and coaches (`Person` + `AggregateRating`), generated `sitemap.xml`
  and `robots.txt`.

## Design

- Palette: navy `#0a1628`, blue `#1a4fa0`, sky `#2a7de1`, amber `#e8a020`.
- Type: **Barlow Condensed** (headings) + **DM Sans** (body), loaded via `next/font`.
- Mobile-first, clean cards, sticky filters, strong search.

---

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

That's it — the site is fully browsable with seed data.

## Connecting Supabase (optional, for auth + persistence)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.local.example` to `.env.local` and fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   NEXT_PUBLIC_SITE_URL=https://soccerdadhq.com
   ```

4. **Auth providers:** in the Supabase dashboard → Authentication → Providers, enable **Email** and
   **Google** (add your Google OAuth client ID/secret). Add your site URL and
   `https://YOUR-DOMAIN/auth/callback` to the allowed redirect URLs.
5. Restart `npm run dev`. Login, persistent reviews, votes and the newsletter list are now live.

## Email delivery (optional, for welcome + digests)

Email uses [Resend](https://resend.com). Add to `.env.local`:

```
RESEND_API_KEY=re_...
EMAIL_FROM=The Sideline <sideline@yourdomain.com>   # sender must be on a Resend-verified domain
```

With these set, the **welcome email** sends on newsletter signup and the **weekly region digests**
send via the cron. Without them, email is a safe no-op. Two cron jobs are configured in `vercel.json`
(monthly ranking snapshot, weekly newsletter); they need `SUPABASE_SERVICE_ROLE_KEY` + `CRON_SECRET`.
Preview the digests anytime: `npx tsx scripts/render-digest.ts`.

## Admin / moderation queue (`/admin`)

Review and act on submissions — claim requests, commitment announcements, ad orders, partner
inquiries and reviews. To access it:

1. Set `SUPABASE_SERVICE_ROLE_KEY` in the environment (server-only; also used by the crons).
2. Promote a user to admin: in the `profiles` table, set their `role` to `admin`.
3. Log in as that user → an "⚙ Moderation queue" link appears in your dashboard, and `/admin` opens.

Approvals publish commitments, mark claims/orders, and let you remove abusive reviews. `/admin` is
`noindex` and disallowed in `robots.txt`.

The seed SQL is generated from the same data the app ships with:

```bash
npx tsx scripts/gen-seed-sql.ts   # regenerates supabase/seed.sql
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects Next.js.
3. Add the three `NEXT_PUBLIC_*` environment variables (if using Supabase).
4. Deploy. News pages use ISR (`revalidate = 1800`); club/coach pages are statically generated
   with `revalidate = 3600`.

---

## Project structure

```
app/                     App Router pages & routes
  page.tsx               Homepage
  clubs/                 Directory + [slug] profile
  coaches/               Directory + [slug] profile
  news/                  RSS-aggregated news
  rankings/              Community rankings
  login/                 Auth (Google + email)
  dashboard/             User dashboard
  api/                   newsletter · reviews · votes
  auth/callback/         OAuth/email confirmation handler
  sitemap.ts · robots.ts SEO
components/               UI components (cards, stars, filters, forms…)
lib/
  seed.ts                50+ real Florida clubs → full profiles + reviews
  rankings.ts            ranking boards across 6 categories
  news.ts                RSS fetch + categorizer + fallback
  data.ts                filtering / query layer (+ Supabase review merge)
  regions.ts             regions, leagues, age groups, review categories
  supabase/              browser + server clients (no-op without keys)
supabase/
  schema.sql             tables, RLS, triggers, vote-tally view
  seed.sql               generated seed (clubs, coaches, reviews, tryouts, rankings)
scripts/gen-seed-sql.ts  regenerates seed.sql from lib/seed.ts
```

## Database schema

`profiles`, `clubs`, `coaches`, `reviews`, `tryouts`, `rankings`, `votes`,
`newsletter_subscribers` — all with Row Level Security: public read on reference/community data,
authenticated writes for reviews/votes, one-vote-per-user-per-item-per-month, and an auto-profile
trigger on signup.

---

*Independent. Not affiliated with any league or club. News headlines link to and remain the property
of their original publishers.*
