# Minivoda

A living interactive prototype — a digital twin of the Nivoda production platform. Minivoda is the single source of truth for how features should look and behave, replacing static Figma designs with a real, clickable application backed by hardcoded fixture data.

Lives in the Clarity V2 monorepo as `packages/test-app/`. It is the first live consumer of `@nivoda/components` (the Nivoda design system) — building flows here exercises the design system in production-shaped conditions. See the root [README.md](../../README.md) for the broader strategy.

**What it's used for:**

- **UX pitch tool** — propose and validate design ideas internally before they reach production.
- **Customer-facing prototype** — share with customers for usability testing, user research, and interviews.
- **Ahead-of-production designs** — new feature designs live here so stakeholders can interact with them directly.

Deployed to Vercel. No live database — all data is hardcoded fixture arrays.

## What's Built

### Fully functional

- **Marketing landing page** — public homepage with sign-in prompt
- **Authentication** — sign in / sign out via JWT cookie auth; all buyer pages are protected
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
- **Search** — global search (results page + typeahead suggest), substring match across all product categories
- **Help Centre** — dedicated `/help` surface outside the buyer area
- **Share modal** — customise, generate, and share via link, QR code, WhatsApp, or email (Minivoda branding is stripped from shared content)
- **App shell** — header with search bar, currency selector, shortlist/cart counters, sidebar navigation, mobile drawer
- **Dark mode** — press `d` to toggle

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
| Component kitchen sink (dev only) | `/buyer/ui-kitchen-sink` |

Buyer routes are organised into three route groups — `(shop)`, `(checkout)`, `(configurator)` — each providing an independent layout while sharing the `/buyer` URL prefix.

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
| Auth | JWT (`jose`) — HttpOnly cookie, 24h expiry |
| Data | Hardcoded TypeScript fixture arrays under `fixtures/` |
| Hosting | Vercel |

---

Everything below this line is for developers working on the codebase.

---

## Getting Started

### Prerequisites

- **Node.js** — v22 or later (see root `package.json` `engines` field)

### Install and run

This package is part of the `clarity-v2` npm workspace. Install from the **repo root**, not from inside this package:

```bash
cd ../.. && npm install
```

All remaining commands run from inside `packages/test-app/`. Copy the example environment file:

```bash
cp .env.example .env.local
```

Start the dev server:

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). Sign in with the credentials in `.env.local` (defaults: `demo@minivoda.test` / `demo`).

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `AUTH_USERNAME` | `demo@minivoda.test` | Login email for the demo account |
| `AUTH_PASSWORD` | `demo` | Login password for the demo account |
| `JWT_SECRET` | `dev-secret-not-for-production` | Signs the `minivoda_jwt` HttpOnly cookie. Use a strong random value in any shared environment. |
| `DEMO_LATENCY_MIN_MS` | `80` | Minimum artificial latency (ms) on all data fetches |
| `DEMO_LATENCY_MAX_MS` | `320` | Maximum artificial latency (ms) on all data fetches |

The defaults work out of the box for local development. Do not commit `.env.local`.

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
  login/                        # Sign-in page (JWT cookie auth)
  (help)/
    help/                       # Help Centre
  buyer/                        # Authenticated buyer area (protected by middleware)
    layout.tsx                  # Session layout
    (shop)/                     # Buyer shell (nav, footer)
      page.tsx                  # Buyer home (hero carousel, category grid)
      browse/                   # Product categories (list + [slug] detail)
      orders/                   # Order list + [id] detail
      shortlists/               # Shortlists list + [id] detail
      finances/                 # Finance overview + [id] statement
      search/                   # Search results
      settings/                 # Placeholder
      ui-kitchen-sink/          # Component showcase (dev only)
    (checkout)/checkout/        # Checkout page + confirmation
    (configurator)/             # Engagement-ring configurator sub-flow (select-stone, etc.)

components/
  shell/                        # App chrome: navigation bar, mobile drawer, footer
  layouts/                      # Reusable page layout wrappers
                                #   layout-base, layout-browse, layout-configurator,
                                #   layout-product-list, layout-product-detail, layout-under-construction
  products/                     # Product-specific display components
  orders/                       # Order list/detail components
  finances/                     # Finance list/detail components
  checkout/                     # Checkout-flow components
  filters/                      # Filter UI compositions
  search/                       # Search UI compositions
  *.tsx                         # Top-level providers and widgets
                                #   theme-provider, home-carousel, share-modal,
                                #   product-actions, sign-out-button

fixtures/
  types/                        # Canonical TypeScript types (one file per domain)
                                #   diamond, gemstone, melee, engagement-ring,
                                #   user, order, finance, shortlist
  products/                     # Product fixture arrays (natural-diamonds, lab-grown-diamonds,
                                #   gemstones, natural-melee, lab-grown-melee, engagement-rings)
  user.ts                       # HARDCODED_USER + addresses
  orders.ts                     # 10 hardcoded orders
  shortlists.ts                 # 10 hardcoded shortlists
  finances.ts                   # 10 hardcoded finance documents

hooks/
  use-cart-store.ts             # Zustand cart store
  use-checkout-store.ts         # Zustand checkout store
  use-shortlists-state.ts       # Shortlists client state
  use-search.ts                 # Search query + suggest hook
  use-mobile.ts                 # Responsive breakpoint hook

lib/
  api/                          # Data-access modules — one per domain (diamonds, gemstones, melee,
                                # jewelry/, orders, shortlists, invoices, finances, search,
                                # filters, addresses, users)
  auth/                         # JWT auth utilities (config.ts, jwt.ts, current-user.ts)
  navigation.ts                 # Sidebar navigation tree
  utils.ts                      # Shared helpers

providers/
  user-provider.tsx             # UserProvider context + useUser() hook

public/                         # Static assets
```

## Data Layer

Data flows through two layers: **fixtures → API → page**.

1. **`fixtures/`** — Hardcoded TypeScript arrays. Each domain has a canonical type in `fixtures/types/`; full detail shapes are stored once per item; list shapes are projections via helpers (`toDiamondListItem`, etc.).
2. **`lib/api/`** — Data-access layer. Each module exposes `fetch*` functions that filter, sort, and project the fixture arrays in memory. All functions include artificial latency (`simulateLatency()`, 80–320ms configurable via env vars). Pages never import fixtures directly.
3. **Pages** — Server components that call `lib/api/` functions and pass data to presentational components.

### Simulating error states

Any server-side page supports `?simulate=error` in the URL. This calls `checkSimulateError(searchParams)` at the top of the page, which throws a synthetic error — useful for exercising Next.js error boundary behaviour without breaking real data.

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
import { HARDCODED_USER } from "@/fixtures/user"
```

---

*Last reviewed: 2026-04-30*
