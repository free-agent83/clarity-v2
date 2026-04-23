# Minivoda

A living interactive prototype — a digital twin of the Nivoda production platform. Minivoda is the single source of truth for how features should look and behave, replacing static Figma designs with a real, clickable application backed by a live database.

Lives in the Clarity V2 monorepo as `packages/test-app/`. It is the first live consumer of `@nivoda/components` (the Nivoda design system) — building flows here exercises the design system in production-shaped conditions. See the root [README.md](../../README.md), [VISION.md](../../VISION.md), and [ROADMAP.md](../../ROADMAP.md) for the broader strategy.

**What it's used for:**

- **UX pitch tool** — propose and validate design ideas internally before they reach production.
- **Customer-facing prototype** — share with customers for usability testing, user research, and interviews.
- **Ahead-of-production designs** — new feature designs live here so stakeholders can interact with them directly.

Deployed to Vercel with a Supabase Postgres backend.

## What's Built

### Fully functional

- **Marketing landing page** — public homepage with sign-in prompt
- **Authentication** — sign in / sign out via Supabase Auth; all buyer pages are protected
- **Buyer home** — hero carousel and product category grid
- **Product browsing** — six categories, each with a listing page and individual product detail pages:
  - Natural diamonds, lab-grown diamonds, gemstones, natural melee, lab-grown melee, engagement rings
- **Product filters and sorting** — wired across listing pages (filter sidebar, sort dropdown, calculator popover)
- **Engagement ring configurator** — choose metal type, colour, quality, and stone shape, then select a matched diamond in a dedicated stone-selection flow (`/select-stone`, `/added-to-cart`)
- **Cart** — add to cart, update quantities, remove items; state persisted via Zustand store; cart sheet accessible from the shell
- **Checkout flow** — checkout page plus confirmation step; checkout state persisted via Zustand store
- **Orders** — order list with status tabs, filters, and badges; order detail with progress timeline, item breakdown, payment info, delivery address, and updates
- **Shortlists** — shortlists list and individual shortlist detail pages
- **Finances** — finances overview and individual finance statement detail pages
- **Search** — global search (results page + typeahead suggest), wired to `/api/v1/search`
- **Help Centre** — dedicated `/help` surface outside the buyer area
- **Share modal** — customise, generate, and share via link, QR code, WhatsApp, or email (Minivoda branding is stripped from shared content)
- **App shell** — header with search bar, currency selector, shortlist/cart counters, sidebar navigation, mobile drawer
- **Dark mode** — press `d` to toggle
- **Admin area** — full CRUD for orders, shortlists, invoices, and products; god-mode auth via `app_metadata.role`; Supabase Realtime sync pushes admin mutations to buyer-facing views; cross-tab user switching via BroadcastChannel
- **Public REST API** — versioned under `/api/v1/` — see [`docs/api/README.md`](docs/api/README.md) for the contract

### Under construction (placeholder pages exist)

- Settings
- Custom jewellery

### Not yet started

- Wedding bands category, tennis bracelets category
- My Memo, Requests, Holds, Feed Centre

## Site Map

All buyer-facing pages require sign-in. The URL paths below are relative to the deployed site.

| Page | Path |
|---|---|
| Marketing landing page | `/` |
| Sign in | `/login` |
| Help Centre | `/help` |
| Buyer home | `/buyer` |
| Search results | `/buyer/search` |
| Natural diamonds — list / detail | `/buyer/browse/natural-diamonds` / `/:id` |
| Lab-grown diamonds — list / detail | `/buyer/browse/lab-grown-diamonds` / `/:id` |
| Gemstones — list / detail | `/buyer/browse/gemstones` / `/:id` |
| Natural melee — list / detail | `/buyer/browse/natural-melee` / `/:id` |
| Lab-grown melee — list / detail | `/buyer/browse/lab-grown-melee` / `/:id` |
| Engagement rings — list / detail | `/buyer/browse/jewelry/engagement-rings` / `/:id` |
| Engagement rings — select stone | `/buyer/browse/jewelry/engagement-rings/:id/select-stone` |
| Engagement rings — added to cart | `/buyer/browse/jewelry/engagement-rings/:id/added-to-cart` |
| Custom jewellery | `/buyer/browse/custom-jewellery` |
| Orders — list / detail | `/buyer/orders` / `/:id` |
| Shortlists — list / detail | `/buyer/shortlists` / `/:id` |
| Finances — list / detail | `/buyer/finances` / `/:id` |
| Checkout | `/buyer/checkout` |
| Checkout confirmation | `/buyer/checkout/confirmation` |
| Settings | `/buyer/settings` |
| Admin — home | `/buyer/admin` |
| Admin — orders / invoices / products / shortlists | `/buyer/admin/{orders,invoices,products,shortlists}` |
| Component kitchen sink (dev only) | `/buyer/ui-kitchen-sink` |

Buyer routes are organised into four route groups — `(shop)`, `(admin)`, `(checkout)`, `(configurator)` — each providing an independent layout while sharing the `/buyer` URL prefix.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI library | React 19 |
| Styling | Tailwind CSS v4 |
| UI primitives | `@nivoda/components` — see [`packages/components/`](../components/) |
| Design tokens | `@nivoda/components/web-theme.css` — sourced from [`packages/tokens/`](../tokens/) |
| Client state | Zustand (cart, checkout, shortlists) |
| Validation | Zod |
| Icons | Tabler Icons |
| Charts | Recharts |
| Database | Supabase Postgres |
| ORM | Drizzle ORM |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime (admin → buyer view sync) |
| Hosting | Vercel |

---

Everything below this line is for developers working on the codebase.

---

## Getting Started

### Prerequisites

- **Node.js** — a recent LTS (tested against 20+)
- **Docker** — required to run the local Supabase database

### Install and run

This package is part of the `clarity-v2` npm workspace. Install from the **repo root**, not from inside this package:

```bash
cd ../.. && npm install
```

All remaining commands run from inside `packages/test-app/`. Copy the example environment file:

```bash
cp .env.example .env.development.local
```

Start the local database (requires Docker to be running):

```bash
npm run db:start
```

After the containers are up, get the anon key and paste it into `.env.development.local`:

```bash
npx supabase status
```

Copy the `anon key` value into `.env.development.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Apply migrations and load sample data:

```bash
npm run db:reset
```

Start the dev server:

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description |
|---|---|
| `POSTGRES_URL` | Postgres connection string (default: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL (default: `http://127.0.0.1:54321`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key — get from `npx supabase status` after `db:start` |

## CLI Commands

### App

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
npm run typecheck  # Type-check without emitting output
```

### Database

```bash
npm run db:start    # Start local Supabase containers (requires Docker)
npm run db:stop     # Stop local Supabase containers
npm run db:reset    # Drop DB, apply all migrations, load sample data
npm run db:generate # Generate a migration from schema changes
npm run db:migrate  # Apply pending migrations
npm run db:studio   # Open Drizzle Studio (browser-based DB explorer)
```

### Adding UI components

UI primitives come from [`packages/components/`](../components/) (`@nivoda/components`). Import them directly:

```ts
import { Button, Input } from "@nivoda/components"
```

Missing primitives are added upstream in the components package, not here. Do not create a `components/ui/` folder in this app, and do not run `npx shadcn add`. See [`packages/components/CONTRIBUTING.md`](../components/CONTRIBUTING.md).

## Folder Structure

```
app/
  layout.tsx                    # Root layout (fonts, theme provider)
  page.tsx                      # Marketing landing page (public)
  login/                        # Sign-in page (Supabase Auth)
  (help)/
    help/                       # Help Centre
  buyer/                        # Authenticated buyer area (protected by middleware)
    layout.tsx                  # Session layout
    (shop)/                     # Buyer shell (nav, footer, realtime)
      page.tsx                  # Buyer home (hero carousel, category grid)
      browse/                   # Product categories (list + [slug] detail)
      orders/                   # Order list + [id] detail
      shortlists/               # Shortlists list + [id] detail
      finances/                 # Finance overview + [id] statement
      search/                   # Search results
      settings/                 # Placeholder
      ui-kitchen-sink/          # Component showcase (dev only)
    (admin)/admin/              # God-mode admin — orders / invoices / products / shortlists CRUD
    (checkout)/checkout/        # Checkout page + confirmation
    (configurator)/             # Engagement-ring configurator sub-flow (select-stone, etc.)
  api/v1/                       # Public REST API — see docs/api/README.md

components/
  shell/                        # App chrome: navigation bar, mobile drawer, footer
  layouts/                      # Reusable page layout wrappers
                                #   layout-base, layout-browse, layout-configurator,
                                #   layout-product-list, layout-product-detail, layout-under-construction
  products/                     # Product-specific display components
  orders/                       # Order list/detail components
  finances/                     # Finance list/detail components
  admin/                        # Admin area components (header, sidebar, CRUD list/modals)
  checkout/                     # Checkout-flow components
  filters/                      # Filter UI compositions
  search/                       # Search UI compositions
  *.tsx                         # Top-level providers and widgets
                                #   theme-provider, realtime-provider, realtime-shell, realtime-status,
                                #   broadcast-listener, home-carousel, share-modal,
                                #   product-actions, sign-out-button

db/
  schema/                       # Drizzle schema (commerce, jewelry, lookups, media, orders, products, users, enums)
  client.ts                     # Drizzle client (postgres.js + drizzle-orm)

hooks/
  use-cart-store.ts             # Zustand cart store
  use-checkout-store.ts         # Zustand checkout store
  use-shortlists-state.ts       # Shortlists client state
  use-realtime-sync.ts          # Bridges SSR data with Supabase Realtime updates
  use-search.ts                 # Search query + suggest hook
  use-mobile.ts                 # Responsive breakpoint hook

lib/
  api/                          # Data-access modules — one per domain (diamonds, gemstones, melee,
                                # jewelry/, orders, cart, shortlists, invoices, finances, search,
                                # filters, addresses, users, auth, admin/)
  supabase/                     # Supabase client utilities (client.ts, server.ts, middleware.ts, api.ts)
  navigation.ts                 # Sidebar navigation tree
  utils.ts                      # Shared helpers

docs/
  api/                          # Public REST API documentation (contract for mobile + external consumers)
  superpowers/                  # Plans and specs from the agent-driven development workflow

public/                         # Static assets

supabase/
  migrations/                   # SQL migration files (generated by drizzle-kit)
  seed.sql                      # Sample data, applied by db:reset
```

## Data Layer

Data flows through three layers: **schema → API → page**.

1. **`db/schema/`** — Drizzle schema definitions. Types are inferred via `$inferSelect`. PostgreSQL conventions: `snake_case` columns, UUIDs, `TIMESTAMPTZ`, soft deletes via `deleted_at`.
2. **`lib/api/`** — Data-access layer. Each module exposes `fetch*` functions that query via Drizzle, paginate results, and return fully resolved objects. Pages never construct raw SQL.
3. **Pages** — Server components that call `lib/api/` functions and pass data to presentational components.

Sample data lives in `supabase/seed.sql` and is loaded by `npm run db:reset`.

## Database Workflow

### Changing the database structure

1. Edit schema files in `db/schema/`.
2. `npm run db:generate` — creates a migration file.
3. `npm run db:migrate` — applies it locally.
4. Update `supabase/seed.sql` if columns or tables changed.
5. `npm run db:reset` — verify everything rebuilds from scratch.
6. Commit schema files, migration, and seed data together.

### Cleaning up migrations

If rapid iteration creates many small migrations:

1. `npm run db:reset` — verify current state works.
2. Delete all files in `supabase/migrations/`.
3. `npm run db:generate` — produces one clean migration.
4. `npm run db:reset` — confirm it still works.

### Pushing to the live site

The prototype has no real users, so the live database is replaced entirely.

**First-time setup:**

1. Create a project on [supabase.com](https://supabase.com).
2. `npx supabase link --project-ref <your-project-ref>` (find the ref in the Supabase dashboard URL).
3. Add production env vars on Vercel: `POSTGRES_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Each deployment:**

```bash
npx supabase db push            # Send migrations to the live database
npx supabase db reset --linked  # Rebuild with sample data
```

### Important

`supabase/seed.sql` is the single source of truth for all sample data. If you tweak data manually in Drizzle Studio, copy those changes back into `seed.sql` before committing.

## Code Style

Formatting is enforced by Prettier (`npm run format`):

- No semicolons
- Double quotes
- 2-space indentation
- Trailing commas (ES5)
- Tailwind class order sorted via `prettier-plugin-tailwindcss`

### Theme

Theme tokens and dark-mode styling come from `@nivoda/components/web-theme.css`, imported by `app/globals.css` (three lines total — Tailwind plus the theme import). Dark mode is the `.dark` class on `<html>`, toggled by `next-themes` — press `d` to toggle. See [`packages/components/`](../components/) and [`packages/tokens/`](../tokens/) for the design-system sources.

### Path alias

`@/*` maps to the package root. Use it for local app code only — primitives come from `@nivoda/components`:

```ts
import { cn } from "@/lib/utils"
import { Button } from "@nivoda/components"
import { db } from "@/db/client"
```

---

*Last reviewed: 2026-04-23*
