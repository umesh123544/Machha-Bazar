# AquaRealm Fish

A mobile-first aquarium fish e-commerce website built with Next.js, TypeScript, and Tailwind CSS.
Customers browse fish and order directly via WhatsApp — no accounts, no checkout, no payment gateway.

## What's included

- **Public site**: Home, Shop, Product detail, About, Care Guide, Contact, Delivery, Privacy Policy, Terms
- **WhatsApp ordering**: "Order via WhatsApp" and "Ask About This Fish" generate a pre-filled WhatsApp
  message with product, variant, quantity, and price
- **Admin panel** at `/admin` protected by a login form (username/password from environment variables)
  - Dashboard with product/category counts
  - Product list: add, delete, toggle active/inactive, toggle stock status
- **PWA**: installable on mobile home screens, with a manifest, service worker, and app icons
- **Favicon and app icons**: generated in `public/icons`
- **SEO**: per-page metadata, sitemap.ts, robots.txt

## Data storage

Products, categories, and site settings live in a **Supabase (PostgreSQL) database**, accessed from
`lib/data.ts` via the service role key on the server. This means admin panel edits (add/delete/stock/
active toggle) **persist in production**, including on Vercel, where the filesystem itself is read-only.

The original `data/*.json` files are kept as a reference/seed source only — they are no longer read at
runtime. See "Setting up Supabase" below to create the database and load that seed data into it.

All pages that read this data (`/`, `/shop`, `/product/[slug]`, `/contact`, `/delivery`, `/admin`, the
root layout, and `sitemap.xml`) are marked `export const dynamic = "force-dynamic"`, so every request
reads the database directly — no rebuild/redeploy is needed for admin changes to show up.

### Setting up Supabase

1. Go to [supabase.com](https://supabase.com), sign up (free), and create a new project.
   Pick any name/region and a database password (save it somewhere — you won't need it directly, but
   Supabase asks for it).
2. Wait ~2 minutes for the project to finish provisioning.
3. In the project, go to **SQL Editor → New query**, paste in the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**. This creates the `products`,
   `categories`, `site_settings`, and `admin_users` tables, plus the `site-images` storage bucket used
   for uploaded photos.
4. Go to **Project Settings → API**. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY` — keep this one secret, never
     put it in client-side code or commit it to git
5. Copy `.env.example` to `.env.local` and fill in all values, including the three Supabase ones above.
6. Seed the database with the original demo products/categories/settings:
   ```
   npm install
   node supabase/seed.mjs
   ```
   This reads `data/*.json` and upserts it into your Supabase tables. Safe to re-run any time — it
   won't create duplicates (matches on `id`).
7. Create the owner admin account (the one that can log into `/admin` with full access):
   ```
   node supabase/create-owner.mjs
   ```
   This hashes `ADMIN_PASSWORD` from `.env.local` and stores it in the `admin_users` table under
   `ADMIN_USERNAME`. Safe to re-run any time you change the password in `.env.local`.
8. Run `npm run dev` and confirm the site loads products from Supabase, and that adding/deleting a
   product in `/admin/products` still shows up after a full page refresh.

### Already had this project running before the admin upgrade?

If you set up Supabase before product photo upload, the banner editor, and multi-user admin were added,
run this once to catch your existing database up:

1. **SQL Editor → New query**, paste in [`supabase/migration_2.sql`](./supabase/migration_2.sql), click
   **Run**. This adds the banner fields, the `admin_users` table, and the `site-images` storage bucket
   to a database that was created from the older `schema.sql`.
2. `npm install` (picks up the new `bcryptjs` dependency).
3. `node supabase/create-owner.mjs` (creates your owner login in the new `admin_users` table).

### Admin panel features

- **Products** (`/admin/products`) — add, edit, delete, toggle stock/active, and upload a photo per fish.
- **Settings & Banner** (`/admin/settings`) — edit the homepage banner (photo, badge text, headline,
  subheading), business info, delivery areas, and social links. Changes are live immediately.
- **Users** (`/admin/users`) — the owner account (created by `create-owner.mjs`) can add more admin
  logins and choose exactly what each one can do: manage products, manage settings/banner, and/or manage
  other users. Non-owner users only see the sections they have permission for.

## Getting started

```bash
npm install
cp .env.example .env.local   # already created for you, edit the values
npm run dev
```

Visit `http://localhost:3000`. Admin panel: `http://localhost:3000/admin`
(default login: `admin` / `aquarealm2026` — change this in `.env.local` before going live).

## Environment variables

See `.env.example`:

- `NEXT_PUBLIC_WHATSAPP_NUMBER` — your WhatsApp business number, digits only, with country code
- `NEXT_PUBLIC_SITE_URL` — your production URL, used for SEO and the sitemap
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — admin login credentials
- `ADMIN_SECRET` — random string used to sign the admin session cookie; change it before deploying

## Deploying to Vercel

1. **Set up Supabase first** — follow "Setting up Supabase" above and confirm the site works locally
   with `npm run dev` before deploying.
2. **Push to GitHub:**
   ```
   cd aquarealm
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
   (Create the empty repo on GitHub first — github.com → New repository — don't initialize it with a
   README, so the push above doesn't conflict.) `.env.local` is already gitignored, so your real keys
   never get pushed.
3. **Import into Vercel:** go to [vercel.com](https://vercel.com) → New Project → import the GitHub repo
   you just pushed. Framework preset auto-detects as Next.js — leave build settings as default.
4. **Add environment variables** in the Vercel project's Settings → Environment Variables (add each for
   Production, Preview, and Development):
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_SITE_URL` — your real domain once you have one, e.g. `https://yourdomain.com`
     (`https://your-project.vercel.app` works fine to start)
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` — change these from the defaults
   - `ADMIN_SECRET` — a long random string (different from your local one)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — same
     values as your `.env.local`
5. Click **Deploy**. Once live, visit `/admin`, log in, and confirm adding/editing a product shows up on
   `/shop` immediately — that confirms Supabase writes are working in production.
6. Any future code change: `git push` to `main` and Vercel redeploys automatically. Product/content edits
   through `/admin` don't need a redeploy at all — they write straight to Supabase.

## Project structure

```
app/                  routes (App Router)
  admin/              admin panel (login, dashboard, products)
  api/                admin login/logout and product CRUD routes
  product/[slug]/     product detail page
  shop/, about/, ...  public pages
components/           shared UI components
lib/                  types, data access, WhatsApp message builder, auth
data/                 JSON "database": products.json, categories.json, settings.json
public/               icons, manifest.json, service worker, robots.txt
```

## Design system

- Colors: deep plum `#2B1B33`, amber `#F0B84C`, berry `#D65E8C`, cream `#FAF6EF` — defined in
  `tailwind.config.ts`
- Font: Inter (falls back to system sans-serif)

## Notes on scope

Per the original brief, only Guppy products are active for ordering; other categories (Betta, Molly,
Platy, Tetra, plants, food, accessories) are seeded as "Coming soon" in `data/categories.json` and can be
activated later. Image upload, multi-admin accounts, and payments are intentionally not implemented, in
line with the brief's phased approach — the architecture (typed product/category/settings models, a
clean data layer) is meant to make adding them later straightforward.
