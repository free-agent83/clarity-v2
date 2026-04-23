# Minivoda

A living interactive prototype — a digital twin of the Nivoda production platform. Minivoda is the single source of truth for how features should look and behave, replacing static Figma designs with a real, clickable application backed by a live database.

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
- **Engagement ring configurator** — choose metal type, colour, quality, and stone shape
- **Orders** — order list with status tabs and badges; order detail with progress timeline, item breakdown, payment info, delivery address, and updates
- **Share modal** — customise, generate, and share via link, QR code, WhatsApp, or email (Minivoda branding is stripped from shared content)
- **App shell** — header with search bar, currency selector, wishlist/cart counters, sidebar navigation, mobile drawer
- **Dark mode** — press `d` to toggle

### Under construction (placeholder pages exist)

- Shortlists
- Finances
- Settings
- Admin panel
- Custom jewellery

### Not yet started

- Cart and checkout flow
- Wedding bands category
- My Memo, Requests, Holds, Feed Centre
- Search and filter logic (UI is present but not wired)

## Site Map

All buyer-facing pages require sign-in. The URL paths below are relative to the deployed site.

| Page | Path |
|---|---|
| Marketing landing page | `/` |
| Sign in | `/login` |
| Buyer home | `/buyer` |
| Natural diamonds — list | `/buyer/browse/natural-diamonds` |
| Natural diamonds — detail | `/buyer/browse/natural-diamonds/:id` |
| Lab-grown diamonds — list | `/buyer/browse/lab-grown-diamonds` |
| Lab-grown diamonds — detail | `/buyer/browse/lab-grown-diamonds/:id` |
| Gemstones — list | `/buyer/browse/gemstones` |
| Gemstones — detail | `/buyer/browse/gemstones/:id` |
| Natural melee — list | `/buyer/browse/natural-melee` |
| Natural melee — detail | `/buyer/browse/natural-melee/:id` |
| Lab-grown melee — list | `/buyer/browse/lab-grown-melee` |
| Lab-grown melee — detail | `/buyer/browse/lab-grown-melee/:id` |
| Engagement rings — list | `/buyer/browse/jewelry/engagement-rings` |
| Engagement rings — detail | `/buyer/browse/jewelry/engagement-rings/:id` |
| Custom jewellery | `/buyer/browse/custom-jewellery` |
| Orders — list | `/buyer/orders` |
| Orders — detail | `/buyer/orders/:id` |
| Shortlists | `/buyer/shortlists` |
| Finances | `/buyer/finances` |
| Settings | `/buyer/settings` |
| Admin | `/buyer/admin` |
| Component kitchen sink (dev only) | `/buyer/ui-kitchen-sink` |

Each browse category follows the same pattern: a product listing page and individual product detail pages.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI library | React 19 |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (Radix UI + Base UI) |
| Icons | Tabler Icons |
| Charts | Recharts |
| Database | Supabase Postgres |
| ORM | Drizzle ORM |
| Auth | Supabase Auth |
| Hosting | Vercel |

---

Everything below this line is for developers working on the codebase.

---

## Getting Started

### Prerequisites

- **Node.js** (check `.nvmrc` for the expected version)
- **Docker** — required to run the local Supabase database

### Install and run

```bash
npm install
```

Copy the example environment file:

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

```bash
npx shadcn@latest add <component-name>
```

This places the component in `components/ui/`. Do not create files there manually.

## Folder Structure

```
app/
  layout.tsx                    # Root layout (fonts, theme provider)
  page.tsx                      # Marketing landing page (public)
  login/                        # Sign-in page (Supabase Auth)
  buyer/                        # Authenticated buyer area
    layout.tsx                  # Buyer shell (navigation, footer)
    page.tsx                    # Buyer home (hero carousel, category grid)
    browse/
      natural-diamonds/         # Product list + [slug] detail
      lab-grown-diamonds/       #   "
      gemstones/                #   "
      natural-melee/            #   "
      lab-grown-melee/          #   "
      custom-jewellery/         # Under construction
      jewelry/
        engagement-rings/       # Product list + [slug] detail (with configurator)
    orders/                     # Order list + [slug] detail
    shortlists/                 # Under construction
    finances/                   # Under construction
    settings/                   # Under construction
    admin/                      # Under construction
    ui-kitchen-sink/            # Component showcase (dev only)

components/
  shell/                        # App chrome: navigation bar, mobile drawer, footer
  layouts/                      # Reusable page layout wrappers
    layout-product-detail/      # Product detail layout with certificate/parcel sub-components
  products/                     # Product-specific display components
  ui/                           # shadcn/ui primitives — managed via CLI, do not edit

db/
  schema/                       # Drizzle schema definitions (source of truth for DB structure)
  client.ts                     # Drizzle client (postgres.js + drizzle-orm)

hooks/                          # Custom React hooks

lib/
  api/                          # Data-access modules (one per category/domain)
  supabase/                     # Supabase client utilities (browser, server, middleware)
  navigation.ts                 # Sidebar navigation tree
  utils.ts                      # Shared helpers

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

Colour tokens are CSS custom properties in `app/globals.css` using the `oklch` colour space. Dark mode uses the `.dark` class on `<html>`, toggled by `next-themes`. Press `d` to toggle.

### Path alias

`@/*` maps to the repository root:

```ts
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { db } from "@/db/client"
```

---

*Last reviewed: 2026-03-24*
