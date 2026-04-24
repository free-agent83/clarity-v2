# @nivoda/docs

Fumadocs-powered documentation site for Clarity V2.

## Run locally

From the repo root:

```bash
npx nx dev @nivoda/docs
```

Visit http://localhost:3002

## What it contains

- **Get started** — onboarding for engineers and designers
- **Foundations** — tokens, color, typography, spacing, elevation, motion
- **Components** — 62 components across Actions, Forms, Display, Feedback, Overlays, Navigation, Data, Filtering, Layout, and kit templates. Sourced from `packages/components/src/components/**/COMPONENT.md`
- **Patterns** — higher-order compositions (PLP, filter composition, empty/loading states)
- **Content** — voice, writing, terminology (stubs)
- **Brand** — logo and brand expression, sourced from the brand-system repo
- **Resources** — ROADMAP, VISION, architecture, ADRs, CHANGELOG — rendered from existing repo markdown

Edit any source file, push, and the site rebuilds on the next deploy.

## Deployment

Deployed to Vercel on push. Behind access protection until further notice.
