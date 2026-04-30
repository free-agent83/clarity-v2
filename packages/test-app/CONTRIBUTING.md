# Contributing to `@nivoda/test-app`

Minivoda — a clickable digital twin of the Nivoda product, and the first live consumer of `@nivoda/components`. This package exists to exercise the component library in production-shaped flows.

## Cross-cutting conventions

For branching, commits, merging, versioning, changelog format, ADRs, and PR etiquette, see the root [`CONTRIBUTING.md`](../../CONTRIBUTING.md). They apply uniformly across the monorepo.

## Stack

- Next.js 16, App Router
- React 19
- TypeScript (strict)
- Tailwind v4
- Components from `@nivoda/components` (the component library in this monorepo)

## Running locally

```sh
cd packages/test-app
npm run dev
```

The `dev` script also rebuilds `@nivoda/components` so changes there are picked up on first load.

## Package-specific guidance

This file is intentionally minimal for now. Genuinely test-app-specific guidance accretes here as the app grows — for example, fixture conventions, route-folder layout, and environment variable expectations. Anything cross-cutting goes in root, not here.
