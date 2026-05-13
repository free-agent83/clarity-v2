# Changelog — @nivoda/test-app

Package-specific changes for Minivoda, the test-app digital twin. Newest entries first.

For cross-cutting monorepo changes, see the root [`CHANGELOG.md`](../../CHANGELOG.md). Format and rules: see root [`CONTRIBUTING.md`](../../CONTRIBUTING.md#changelog).

---

## 2026-05-13

- Product images relocated from `public/static/products/<category>/` and the three root placeholders (`ring.jpg`, `diamond.png`, `gemstone.png`) under `public/images/products/<category>/`; the home grid, engagement-rings, natural-diamonds, lab-grown-diamonds, gemstones, natural-melee, lab-grown-melee, and shortlists fixtures all repointed at the new paths. Melee fixtures previously pointed at a `placehold.it` URL that now 403s (and `next/image` blocks unlisted remote hosts anyway) — they now use the new `melee/melee.png` placeholder (`e06160d`).

## 2026-05-07

- `app/globals.css` shrinks to two lines (drops the `@source ".../node_modules/@nivoda/components/dist"` line). The components package now self-declares its Tailwind v4 source paths from inside `web-theme.css`, so consumers no longer need to know — or correctly relative-path — the location of the library's compiled output. Minivoda's CSS entry is now exactly what an external consumer would write. Fixes the broken header / slider / megamenu hover / general styling regression seen when running Minivoda from a git worktree.

## 2026-05-05

- **Categories strip rewritten on top of `Megamenu`** (M2.0.1). Extracted into `components/shell/categories-menu/` (`categories-menu.tsx`, `nav-link-item.tsx`, `engagement-rings-panel.tsx`, `gemstones-panel.tsx`, `index.ts`). Engagement rings and Gemstones items become megamenus driven by a `PANELS` registry; the rest stay plain Next.js links. Triggers carry the category `href` so clicks navigate to the listing while hovering opens the panel. Strip uses the new `bg-negative` / `text-negative-foreground` tokens (drops the inline `--foreground`/`--background` CSS-var override hack). Below `lg` the strip scrolls horizontally with the scrollbar hidden; megamenu panels collapse into bottom Sheets via `MegamenuContent`'s built-in fallback. Each panel is pulled upward by `yOffset={3}` so the seam between strip and panel disappears.
- `npm run dev` now runs `nx watch --projects=components -- nx build components` alongside `next dev --turbopack` (via `concurrently`) so edits in `@nivoda/components` rebuild and hot-reload into Minivoda.

## 2026-04-30 (M1)

- **M1 — Strip Supabase + Drizzle** completed. Ripped the entire DB stack (Supabase, Drizzle ORM, `postgres`), Supabase Auth, the admin area, and the public REST API. Replaced with hardcoded TypeScript fixture arrays under `fixtures/`, JWT cookie auth via `jose`, and in-memory `lib/api/*` projection functions. Every buyer-surface route preserved with identical data shapes. Artificial latency (`80–320ms`) and `?simulate=error` wired to all server pages (`2c70265`, `04f56c0`, `48717c8`, `9ccc4e1`).
- Added `fixtures/types/` as canonical type SoT (8 domain modules); authored fixtures for all 6 product categories, plus user, orders, shortlists, and finances (`cd5234f`–`a26c141`).
- Added `providers/user-provider.tsx` (`UserProvider` + `useUser()` context), `lib/auth/` (JWT sign/verify via `jose`), `middleware.ts` rewrite (JWT cookie gate on `/buyer/*`), and login action rewrite (env-var cred match + cookie mint) (`4360678`, `2c70265`).
- Deleted: `db/`, `lib/supabase/`, `supabase/`, `drizzle.config.ts`, `lib/api/cart.ts`, `lib/api/auth.ts`, all realtime components (`realtime-provider`, `realtime-shell`, `realtime-status`, `broadcast-listener`, `orders-realtime-wrapper`, `use-realtime-sync`), `switch-user.ts`, `app/api/`, `app/buyer/(admin)/`, `lib/api/admin/`, `components/admin/` (`48717c8`, `9ccc4e1`).

## 2026-04-30

- Renamed package `minivoda-digital-twin` → `@nivoda/test-app` to fit the `@nivoda/*` scope (`7b39eb0`).
- Merged the in-flight `claude/festive-beaver-0e136c` branch into `dev`: PLP product lists for diamonds, engagement rings, gemstones, and melee now propagate `businessDays` consistently (`c30630d`, originally `5700f3c`, `8b16d4f`).
- Added stub `CONTRIBUTING.md` pointing to root for cross-cutting policy; carries only test-app-specific notes for now (`e2a1775`).
- Scrubbed the design-triad / "Flow surface" metaphor and Phase A/B/C/D references from `CLAUDE.md` (`9dee241`, `17bcbc5`).

## 2026-04-28

- Top-aligned delivery icons on PLP rows; kept the date parenthetical intact (in-flight work on a feature branch — see roadmap M0.1.3).
- Propagated `businessDays` to all PLP stories and the list-row API.

## 2026-04-27

- Refreshed delivery line copy and styling on `PlpGridItem` (`d6fba23`).

## 2026-04-23

- Added PLP list view with URL-backed pagination and shell updates (`e498d05`).
- Rebuilt PDPs from scratch against the Clarity V2 PDP kit (`451d884`).
- Migrated PLP/PDP to Clarity V2 template primitives (`ec9097e`).
- Adopted `FilterToolbar` from `@nivoda/components` across all six browse pages (natural/lab-grown diamonds, gemstones, natural/lab-grown melee, engagement rings). Each page ships a colocated `filters.tsx` controller; shared `usePlpFilterController` hook drives the drawer + URL flow. DB-backed filtering for five of six PLPs (engagement rings deferred).
