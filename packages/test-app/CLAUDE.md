# packages/test-app — Claude Code guidance

Orients agents when working inside `packages/test-app/` — Minivoda, the living digital twin of the Nivoda platform. For system-wide conventions, see the root [CLAUDE.md](../../CLAUDE.md).

## What this package is

Minivoda — a clickable digital twin of the Nivoda product. The first live consumer of `@nivoda/components`, used to exercise the component library in production-shaped flows.

Next.js 16 App Router + React 19 + Tailwind v4, deployed to Vercel. No live database — all data is hardcoded fixture arrays under `fixtures/`; auth is JWT cookie via `jose`.

## How agents orient here

Read these, in order, before touching this package:

1. **[README.md](./README.md) — what's built, what isn't, and what it's for.** The product-facing description of Minivoda: feature state (functional / under construction / not started), intended users, and deployment shape. This is the entry point for understanding the surface area before changing it.
2. **[../components/COMPONENTS.md](../components/COMPONENTS.md) — the Clarity V2 library map.** UI primitives come from `@nivoda/components`, not from this package. Before composing a screen, skim this to pick the right component and token. If the primitive you need is missing, stop — see next.
3. **[../components/CONTRIBUTING.md](../components/CONTRIBUTING.md) — how to contribute upstream.** The rule-book for adding or changing primitives in the design system. Missing primitives are fixed *there*, never patched locally here.

## Minivoda-specific rules

Everything else lives in the docs above. These three are the rules most often violated:

- **No design-system primitives in this package.** Do not create a `components/ui/` folder. Do not run `npx shadcn add`. Primitives are imported from `@nivoda/components`; missing ones are contributed upstream. Components under `components/` here are application compositions only — shell, layouts, product views, etc.
- **Tokens and theme come from the library.** `app/globals.css` is intentionally three lines — it imports Tailwind and `@nivoda/components/web-theme.css`. Do not inline tokens, raw colours, or bespoke `@theme` blocks here.
- **Branding: "Minivoda", not "Nivoda"** — in user-facing text. URLs (S3 buckets, API hosts, etc.) stay as-is. Sharing flows must strip Minivoda branding entirely so shared artefacts never reveal our identity to end customers.

## Agent behaviour

**Agents propose, humans ratify.** New flows, schema changes, new API endpoints, or anything the docs above don't explicitly cover are human decisions. Flag gaps and wait for a ruling — do not improvise, do not invent.
