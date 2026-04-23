# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Minivoda is a **living interactive prototype** — a digital twin of the Nivoda production platform. It serves as:

- **UX pitch tool** — used internally to propose and validate design ideas before they reach production.
- **Figma replacement** — Figma designs are being deprecated; this project becomes the single source of truth for how features should look and behave.
- **Customer-facing prototype** — shared with customers for usability testing, user research, and interviews. Ahead-of-production designs live here so stakeholders can interact with them directly.

The primary goal is **visual and behavioural fidelity** to production — or ahead of it where new designs are being explored. A real backend is being implemented alongside this frontend.

Deployed to Vercel (personal account). Solo developer for now.

## Commands

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier (formats all .ts/.tsx files)
npm run typecheck  # TypeScript type check without emitting
```

```bash
npm run db:start   # Start Supabase containers (requires Docker)
npm run db:stop    # Stop Supabase containers
npm run db:reset   # Drop DB, apply migrations, seed data
npm run db:generate # Generate migration from schema changes
npm run db:migrate  # Apply pending migrations
npm run db:studio   # Open Drizzle Studio (DB browser)
```

## Environment Setup

Copy `.env.example` to `.env.development.local` and fill in the values:

```bash
cp .env.example .env.development.local
```

After starting Supabase (`npm run db:start`), run `npx supabase status` to get the local `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Adding shadcn/ui Components

Components are **not** auto-generated — add them via CLI:

```bash
npx shadcn@latest add <component-name>
```

This places the component in `components/ui/`. Do not manually create files there.

## Architecture

- **Next.js 16 App Router** — pages live under `app/`, with `app/layout.tsx` as the root layout.
- **Styling** — Tailwind CSS v4 with `tw-animate-css`. Theme tokens are CSS custom properties defined in `app/globals.css` using `oklch` color space. The `@theme inline` block maps them to Tailwind utilities.
- **Dark mode** — handled by `next-themes` via `ThemeProvider` (wraps the entire app in `layout.tsx`). Toggle with the `d` key. Uses `.dark` class on `<html>`.
- **shadcn/ui** — components in `components/ui/` are based on `radix-ui` and `@base-ui/react`. They use `cva` for variants and the `cn` utility from `lib/utils.ts`.
- **Fonts** — Inter (`--font-sans`) and Geist Mono (`--font-mono`) loaded via `next/font/google` in `layout.tsx`.
- **Path alias** — `@/*` maps to the repo root, so `@/components/ui/button` resolves to `components/ui/button.tsx`.
- **Database** — Supabase Postgres (local via Docker, managed by Supabase CLI as a project-level devDependency). Drizzle ORM for all database queries; Supabase JS client reserved for Auth and Storage (future). Schema definitions live in `db/schema/`, types are inferred via Drizzle's `$inferSelect`.
- **Seed data** — `supabase/seed.sql`, applied automatically by `supabase db reset`. Original mock data has been removed.
- **Authentication** — Supabase Auth. `middleware.ts` refreshes the session on every `/buyer/*` request. `lib/supabase/` contains three client factories: `client.ts` (browser), `server.ts` (Server Components / Route Handlers), and `middleware.ts` (edge middleware). The root `app/page.tsx` is a public marketing page; `app/login/` handles sign-in; all `app/buyer/*` routes require an authenticated session.
- **Route structure** — The app has two top-level route segments: `/login` (public) and `/buyer` (authenticated). All buyer-facing pages (browse, orders, shortlists, etc.) live under `app/buyer/`. Route groups `(shop)` and `(admin)` under `app/buyer/` provide independent layouts sharing the `/buyer` URL prefix.
- **REST API** — Versioned under `/api/v1/`. Route Handlers in `app/api/` are thin wrappers around `lib/api/` functions. Two-layer auth: API key (`X-API-Key` header) on every request, Supabase Bearer token for user-specific endpoints. Server Components continue calling `lib/api/` directly.

## Branding

This application is called **Minivoda**. Whenever you encounter or generate text that says "Nivoda", replace it with "Minivoda" — except in URLs (e.g. S3 bucket URLs), which must remain unchanged to avoid breaking external resources.

## User Personas

Full persona details in `docs/personas.md`. Key design implications for the core user (jewellers):

- Desktop-first. Mobile is secondary.
- Filters are the #1 navigation pattern — fast, precise, trade-parameter-aware.
- Minimise steps to purchase — "buy now" is the most critical path.
- All sharing features must strip Minivoda branding completely. Never leak our identity to end customers.
- Simple UI, no tech jargon (industry jargon is fine). If a flow requires explanation, it's too complicated.
- Support both casual users (1–2 orders/month) and power users (hundreds of stones, all day).

## File Structure

```
app/
  layout.tsx                  # Root layout (fonts, ThemeProvider)
  page.tsx                    # Marketing landing page
  login/                      # Login page (Supabase Auth)
  buyer/                      # Authenticated buyer area (protected by middleware)
    layout.tsx                # Shared buyer layout (session only)
    (shop)/
      layout.tsx              # Buyer shell (LayoutBase + RealtimeProvider + RealtimeStatus)
      page.tsx                # Buyer home — hero carousel + category grid
      browse/
        natural-diamonds/     # List + [slug] detail
        lab-grown-diamonds/   #   "
        gemstones/            #   "
        natural-melee/        #   "
        lab-grown-melee/      #   "
        custom-jewellery/     # Under construction
        jewelry/engagement-rings/ # List + [slug] detail (with ring configurator)
        jewelry/wedding-bands/    # List + [slug] detail
        jewelry/tennis-bracelets/ # List + [slug] detail
      orders/                 # Orders list + [id] detail (UUID-based routing)
      shortlists/             # Under construction
    (admin)/
      admin/
        layout.tsx            # Admin shell (header + sidebar, god-mode gate)
        page.tsx              # Redirects to /buyer/admin/orders
        orders/page.tsx       # Orders CRUD
        shortlists/page.tsx   # Shortlists CRUD
        invoices/page.tsx     # Invoices CRUD
        products/page.tsx     # Products CRUD
  api/
    v1/
      diamonds/             # GET list + GET [id] detail
      lab-grown-diamonds/   #   "
      gemstones/            #   "
      natural-melee/        #   "
      lab-grown-melee/      #   "
      jewelry/
        engagement-rings/   # GET list + GET [id] detail
        wedding-bands/      # GET list + GET [id] detail
        tennis-bracelets/   # GET list + GET [id] detail
      orders/               # GET list + GET [id] detail (authenticated)
      cart/                 # GET + POST/PATCH/DELETE items (authenticated)
      shortlists/           # GET + POST/DELETE items (authenticated)
      search/               # GET full search
        suggest/            # GET typeahead
      me/                   # GET profile
        addresses/          # GET addresses
      admin/
        orders/             # GET list + POST create; [id] GET + PATCH + DELETE
        shortlists/         # GET list + POST create; [id] GET + PATCH + DELETE
        invoices/           # GET list + POST create; [id] GET + PATCH + DELETE
        products/           # GET list + POST create; [id] GET + PATCH + DELETE
        lookups/            # GET all lookup data
        users/              # GET all users
        impersonate/        # POST switch user session
    finances/                 # Under construction
    settings/                 # Under construction
    ui-kitchen-sink/          # Component showcase
components/
  layouts/                    # Reusable page layouts (LayoutBase, LayoutBrowse, LayoutProductList, LayoutProductDetail, etc.)
  shell/                      # App shell (BuyerNav, NavSheet, AppFooter, CategoriesMenu)
  ui/                         # shadcn/ui primitives — do not edit manually
  products/                   # Product-specific components (ProductListItem)
  admin/                      # Admin area components (header, sidebar, CRUD list/modals)
  share-modal.tsx             # Sharing flow (copy link, QR, WhatsApp, email)
  product-actions.tsx         # Shortlist + Share buttons
db/
  client.ts                   # Drizzle client (connects via POSTGRES_URL)
  schema/                     # Drizzle schema definitions (source of truth for DB structure)
hooks/
  use-realtime-sync.ts        # Realtime subscription hook (bridges SSR data with live updates)
lib/
  api/                        # Data-access layer — Drizzle queries, pagination, filtering
    admin/                    # Admin data-access layer — CRUD operations, lookups, user management
  supabase/                   # Supabase client utilities (client.ts, server.ts, middleware.ts)
  navigation.ts               # Navigation tree (sidebar items, badges)
  utils.ts                    # cn() helper
middleware.ts                 # Next.js middleware — refreshes Supabase session on /buyer/* routes
```

## Data Layer Pattern

Data flows through three layers: **schema → API → page**.

1. **`db/schema/`** — Drizzle ORM schema definitions. These TypeScript files are the source of truth for all tables, columns, relations, and enums. Types are inferred via `$inferSelect`.
2. **`lib/api/`** — Data-access layer. Each module queries Supabase Postgres via Drizzle, exposing `fetch*` functions that join, paginate, filter, and return fully resolved objects.
3. **Pages** — Server components that call `lib/api/` functions and pass resolved data to layout/presentational components.

When adding new entities, follow this same pipeline. The API layer is the only place that joins data.

**Note on product categorisation:** The `productTypeEnum` Postgres enum has been removed. Products are now categorised via a FK `product_category_id` pointing to the `product_categories` lookup table. Category slugs are: `natural_diamond`, `lab_grown_diamond`, `gemstone`, `natural_melee`, `lab_grown_melee`, `engagement_ring`, `wedding_band`, `tennis_bracelet`.

**Note on jewelry schema:** The `jewelry` parent table and `jewelry_types` lookup table have been dropped. Each jewelry subcategory is now a standalone table: `engagement_rings`, `wedding_bands`, `tennis_bracelets`. Junction tables are `engagement_ring_available_metals`, `engagement_ring_compatible_stones`, and `wedding_band_available_metals`. The `jewelry_configuration_images` table has been removed — configuration images are no longer part of the schema.

## Current Feature Status

**Built and functional:**
- Authentication — Supabase Auth with login page, session middleware, protected `/buyer/*` routes
- Marketing landing page (`app/page.tsx`) with sign-in CTA
- Buyer home page with hero carousel and category grid
- Product listing pages (all 6 categories) with pagination
- Product detail pages with image galleries, specs tables, related items
- Jewelry engagement ring configurator (metal type/color/quality, stone shape)
- Orders list with status tabs and badges
- Order detail with progress timeline, item details, payment info, delivery address, updates, summary
- Share modal with full flow (customise → loading → ready; copy link, QR, WhatsApp, email)
- App shell (header with search bar, currency selector, wishlist/cart counters, mobile nav drawer)
- Dark mode (toggle with `d` key)
- Admin area — Full CRUD for orders, shortlists, invoices, and products. God-mode auth (`app_metadata.role`), category-adaptive product forms, nuclear cascade deletes, Supabase Realtime sync to buyer pages, cross-tab user switching via BroadcastChannel
- Supabase Realtime — Live data sync from admin mutations to buyer-facing views, connection/sync status indicator

**Under construction (page exists with placeholder UI):**
- Shortlists page
- Finances page
- Settings page
- Custom jewellery browse page

**UI present, not wired:**
- Search bar (no filtering logic)
- Product filters and sorting (dropdowns exist, no backend)
- Order filtering/sorting (tabs exist, no logic)
- Cart button (shows static count, no cart page or state)

**Not yet built:**
- Cart page and checkout/purchase flow
- Wedding bands category
- My Memo, Requests, Holds, Feed Centre pages

## React & Next.js Code Quality

**Always** invoke the `/vercel-react-best-practices` skill before writing, reviewing, or refactoring any React or Next.js code (components, pages, layouts, data fetching, hooks, etc.). Apply its guidelines to every code change — do not skip this step.

## Database Workflow

### Making schema changes

1. **Edit schema files** in `db/schema/`. These TypeScript definitions are the source of truth.
2. **Generate a migration:** `npm run db:generate`. This diffs the schema against the last migration and writes a new `.sql` file into `supabase/migrations/`. Review the generated SQL before proceeding.
3. **Apply locally:** `npm run db:migrate`.
4. **Update seed data** in `supabase/seed.sql` if the change affects columns, tables, or constraints.
5. **Verify end-to-end:** `npm run db:reset` (drops everything, re-runs all migrations, then seeds). If this succeeds, the migration chain is healthy.
6. **Commit together:** schema `.ts` files, generated migration `.sql`, and updated `seed.sql` should always move as a single commit.

### Squashing migrations during early development

If rapid iteration produces a messy chain of small migrations, squash them before committing:

1. `npm run db:reset` — verify current state works.
2. Delete all files in `supabase/migrations/`.
3. `npm run db:generate` — produces a single fresh migration from the current schema.
4. `npm run db:reset` — verify the fresh migration + seed works.
5. Commit the clean migration.

This is safe as long as there is no production migration history to preserve.

### Deploying to production (Supabase hosted)

Because this is a mock project with no real user data, the remote database is replaced wholesale rather than carefully migrated.

**One-time setup:**

1. Create a Supabase project at supabase.com.
2. Link local project: `npx supabase link --project-ref <project-ref>` (find the ref in the Supabase dashboard URL).
3. Set production env vars on Vercel:
   - `POSTGRES_URL` — pooled connection string from Supabase dashboard (Settings → Database → Connection string, Transaction pooler mode).
   - `NEXT_PUBLIC_SUPABASE_URL` — project API URL (e.g. `https://<ref>.supabase.co`).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard (Settings → API).

**Each deployment — Option A (migrations + seed, recommended):**

```bash
npx supabase db push          # Push migrations to remote
npx supabase db reset --linked # Drop + rebuild from migrations + seed
```

**Each deployment — Option B (dump + restore, for hand-tweaked local data):**

```bash
# Dump local database
pg_dump -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  --clean --if-exists --no-owner --no-privileges \
  -F plain -f local_dump.sql

# Restore to remote
psql "<remote-connection-string>" -f local_dump.sql
```

Add `local_dump.sql` to `.gitignore`.

| Scenario | Approach |
|---|---|
| Schema changes only, seed data up to date | Option A |
| Hand-crafted data in Drizzle Studio | Option B |
| Schema changes + hand-crafted data | Update `seed.sql` first, then Option A |

### Golden rule

**`seed.sql` is the data source of truth.** Any manual data tweaks in Drizzle Studio must be ported back into `seed.sql` before committing. This ensures `npm run db:reset` always produces a complete, correct database and that production can be rebuilt from scratch at any time.

## Database Optimisations

Although this project now uses a real Supabase Postgres database via Drizzle ORM, when writing, reviewing or refactoring database schema or queries, **always** invoke the `/database-schema-design` skill.

## API Documentation

Any change to files in `app/api/` or `lib/api/` must include a corresponding update to the API documentation in `docs/api/`. This includes:
- New endpoints
- Changed request/response shapes
- Modified error codes
- Changed authentication requirements

The API documentation is the contract for mobile and external consumers. Keeping it in sync is not optional.

## Code Style

Prettier config (enforced via `npm run format`):
- No semicolons
- Double quotes
- 2-space indent
- Trailing commas (ES5)
- Tailwind class sorting via `prettier-plugin-tailwindcss` (canonical order derived from `app/globals.css`)
