# Clarity V2 — Design System & Component Library

The design system, component library, and technical architecture for Nivoda's product surfaces. Built on shadcn/ui, Tailwind CSS, and a bespoke W3C DTCG token pipeline.

For governance, agent instructions, business context, and surface-specific rules, see the [Experience Framework](../experience-framework/) repo.

---

## Start Here

**New to the project?**
- [`CHANGELOG.md`](./CHANGELOG.md) — what's been built, what's in progress, what's next

**Claude Code / AI agents?**
- [`CLAUDE.md`](./CLAUDE.md) — project bootstrap for AI agents: required reading, conventions, things to avoid

**Looking for the technical architecture?**
- [`docs/architecture/architecture.md`](./docs/architecture/architecture.md) — token pipeline, component libraries, documentation layer, and ADRs 001-004

**Designer / token decisions?**
- [`docs/design/token-decisions.md`](./docs/design/token-decisions.md) — the 15 decisions made during the platform-vs-clarity audit
- [`docs/design/token-alignment.md`](./docs/design/token-alignment.md) — side-by-side comparison of platform and Clarity V2 tokens

**Implementation plans?**
- [`docs/plans/`](./docs/plans/) — phased implementation plans and specs

**Research and context?**
- [`docs/research/ds-diagnosis.md`](./docs/research/ds-diagnosis.md) — evidence-based assessment of the current design system stack
- [`docs/research/mobile-ds-diagnosis.md`](./docs/research/mobile-ds-diagnosis.md) — mobile state of play and alignment roadmap
- [`docs/research/code-first-ds.md`](./docs/research/code-first-ds.md) — industry research: code-first design systems, AI tooling, W3C token spec

---

## Repo Structure

```
clarity-v2/
├── CHANGELOG.md                 # Progress log
├── README.md                    # This file
├── docs/
│   ├── architecture/            # Technical architecture + ADRs
│   ├── design/                  # Designer-facing docs (token decisions, comparisons)
│   ├── plans/                   # Implementation plans and specs
│   ├── research/                # Point-in-time research and diagnostics
│   └── archive/                 # Historical documents
└── packages/
    ├── tokens/                  # W3C DTCG token source + bespoke build pipeline
    ├── components/              # shadcn/ui + Radix UI + Tailwind CSS component library
    └── test-app/                # Minivoda — clickable digital twin of the Nivoda platform; first live consumer of @nivoda/components
```

---

## What This Repo Contains

- **Design tokens** — W3C DTCG JSON source, transformed by a bespoke build script into web CSS, shadcn-compatible CSS, JS/TS, React Native, and JSON outputs
- **Component library** — shadcn/ui + Radix UI + Tailwind CSS v4 (early stage — one component so far)
- **Storybook** — component development and documentation
- **Test app** — Vite harness for live component iteration

## What This Repo Does Not Contain

- Governance rules or agent instructions → [Experience Framework](../experience-framework/)
- Business context, personas, or surface rules → [Experience Framework](../experience-framework/)
- The venue where new flows are designed and validated → [Minivoda](../minivoda/clarity-digital-twin/) (the digital twin of the Nivoda platform; where designers and PMs build real working UI against Clarity V2 components, ahead of production)
- Production application code → `platform` repo (existing Nivoda monorepo)
- Scope documents for specific initiatives

## Related Repos

- **[`../experience-framework/`](../experience-framework/)** — governance, principles, surface rules, and agent instructions. The "constitution" to Clarity V2's "law". Owned by design.
- **[`../minivoda/clarity-digital-twin/`](../minivoda/clarity-digital-twin/)** — living interactive prototype of the Nivoda platform, deployed to Vercel with a real Supabase database. The venue where new flows are designed, validated with users, and handed off to engineering as branches. Consumes Clarity V2 components.
- **`../platform/`** — the production Nivoda monorepo. Eventual consumer of Clarity V2 via a migration to be decided with engineering. Owned by engineering; do not modify from here.

---

## Ownership

Owned by the design function. Engineers, product managers, and agents are consumers, not editors. Changes require design review.
