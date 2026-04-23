# packages/test-app — Claude Code guidance

Orients agents when working inside `packages/test-app/` — Minivoda, the living digital twin of the Nivoda platform. For system-wide conventions, see the root [CLAUDE.md](../../CLAUDE.md).

## What this package is

Minivoda — the **"Flow" surface of the Nivoda Design Triad** (see [VISION.md](../../VISION.md)). A clickable, backend-backed replica of the Nivoda product, and the venue where the self-serve delivery path happens: designers and PMs build new flows here using Clarity V2 components + AI agents, validate them with real users, then hand branches to engineering. Figma is a scrapbook; Minivoda is the source of truth for what a flow *is*.

Phase B is currently active (see [ROADMAP.md](../../ROADMAP.md)). This package is the **first live consumer** of `@nivoda/components` — exercising Clarity V2 in production-shaped flows is on the critical path, and work here should serve that goal unless explicitly directed otherwise.

Next.js 16 App Router + React 19 + Tailwind v4 + Supabase Postgres + Drizzle ORM, deployed to Vercel.

## How agents orient here

Read these, in order, before touching this package:

1. **[README.md](./README.md) — what's built, what isn't, and what it's for.** The product-facing description of Minivoda: feature state (functional / under construction / not started), intended users, and deployment shape. This is the entry point for understanding the surface area before changing it.
2. **[../components/COMPONENTS.md](../components/COMPONENTS.md) — the Clarity V2 library map.** UI primitives come from `@nivoda/components`, not from this package. Before composing a screen, skim this to pick the right component and token. If the primitive you need is missing, stop — see next.
3. **[../components/CONTRIBUTING.md](../components/CONTRIBUTING.md) — how to contribute upstream.** The rule-book for adding or changing primitives in the design system. Missing primitives are fixed *there*, never patched locally here.
4. **[docs/api/README.md](./docs/api/README.md) — the REST API contract.** Versioned endpoints under `/api/v1/`. Any change to `app/api/**` or `lib/api/**` must ship with the matching docs update in the same commit — the API is a contract for mobile and external consumers.

## Minivoda-specific rules

Everything else lives in the docs above. These three are the rules most often violated:

- **No design-system primitives in this package.** Do not create a `components/ui/` folder. Do not run `npx shadcn add`. Primitives are imported from `@nivoda/components`; missing ones are contributed upstream. Components under `components/` here are application compositions only — shell, layouts, admin, product views, etc.
- **Tokens and theme come from the library.** `app/globals.css` is intentionally three lines — it imports Tailwind and `@nivoda/components/web-theme.css`. Do not inline tokens, raw colours, or bespoke `@theme` blocks here.
- **Branding: "Minivoda", not "Nivoda"** — in user-facing text. URLs (S3 buckets, API hosts, etc.) stay as-is. Sharing flows must strip Minivoda branding entirely so shared artefacts never reveal our identity to end customers.

## Agent behaviour

**Agents propose, humans ratify.** New flows, schema changes, new API endpoints, or anything the docs above don't explicitly cover are human decisions. Flag gaps and wait for a ruling — do not improvise, do not invent.
